import express from 'express';
import bodyParser = require('body-parser');

// const express = require('express');
// const bodyParser = require('body-parser');
const cors = require('body-parser');
const path = require('path');

const app = express();
const { products } = require('./products.json');
var allOrders: any[] = require('./orders.json');

var filterStatus = "All"
var filterType = "";
var startDate: Date | undefined = undefined;
var endDate: Date | undefined = undefined;

const PORT = 3232;
const PAGE_SIZE = 20;

const port = process.env.PORT || 5000;


// This application level middleware prints incoming requests to the servers console, useful to see incoming requests

app.use((req, res, next) => {
    console.log(`Requset_Endpoint: ${req.method} ${req.url}`);
    res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', '*');
	res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});



app.get('/api/v1/say-somthing', (req, res) => {
    res.send({
        answer: "Hello also from the Server"
    });
});

// Configure the bodyParser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


app.use(cors());

// Require Route
const api = require('./routes/routes.js');
// Configure app to use route
app.use('/api/v1/', api);

// This middleware informs the express application to serve our compiled React files
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    app.use(express.static(path.join(__dirname, '../client/build')));

    // app.get('*', function (req, res) {
    //     res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    // });
};

// Catch any bad requests
// app.get('*', (req, res) => {
//     res.status(200).json({
//         msg: 'Catch All'
//     });
// });




function handleDates(from: string, to: string, resetDate: any) {
	if (resetDate) {
		startDate = undefined;
		endDate = undefined;
	}
	else {
		startDate = from !== undefined ? new Date(from) : startDate;
		endDate = to !== undefined ? new Date(to) : endDate;
	}
}

app.get('/api/orders', (req, res) => {
	const page = <number>(req.query.page || 1);
	filterStatus = ((<string>(req.query.filterOption)) ?? filterStatus).toLowerCase();
	handleDates(
		<string>req.query.startDate,
		<string>req.query.endDate,
		req.query.resetDate
	);
	switch (filterStatus) {
		case 'fulfilled':
		case 'not-fulfilled':
		case 'canceled':
			filterType = 'ful';
			break;
		case 'paid':
		case 'not-paid':
		case 'refunded':
			filterType = 'payment'
			break;
		default:
			filterType = ''
	}
	var filteredOrders: any[] = filterType === '' ? allOrders :
		allOrders.filter((order) => filterType === 'ful' ?
			order.fulfillmentStatus === filterStatus :
			order.billingInfo.status === filterStatus);
	if (startDate !== undefined && endDate !== undefined) {
		const from = startDate;
		const to = endDate;
		filteredOrders = filteredOrders.filter((order) => {
			const orderDate = new Date(order.createdDate);
			return orderDate <= to && orderDate >= from;
		})
	}
	const orders: any[] = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
	const pageCount = filteredOrders.length / PAGE_SIZE;
	res.send([orders, Math.ceil(pageCount)]);
});


app.get('/api/count', (req, res) => {
	const nonDeliveredQuantity = allOrders.filter((order) => order.fulfillmentStatus === 'not-fulfilled').length
	res.send([nonDeliveredQuantity]);
});

app.get('/api/items/:itemId', (req, res) => {
	const itemId = <string>(req.params.itemId);
	const size = <string>(req.query.size || 'small');
	const product = products[itemId];
	res.send({
		id: itemId,
		name: product.name,
		price: product.price,
		image: product.images[size]
	});
});

app.post('/api/orders/:orderId', (req, res) => {
	const orderId = parseInt(req.params.orderId);
	const orderIndex = allOrders.findIndex(order => order.id === orderId);
	const status = <string>allOrders[orderIndex].fulfillmentStatus;
	allOrders[orderIndex].fulfillmentStatus = status === 'fulfilled' ? 'not-fulfilled' : 'fulfilled';
	res.send();
});


app.get('/api/search', (req, res) => {
	const page = <number>(req.query.page || 1);
	const search = <string>req.query.search;
	handleDates(
		<string>req.query.startDate,
		<string>req.query.endDate,
		req.query.resetDate
	);
	var filteredOrders: any[] = allOrders.filter((order) => {
		const orderDate = new Date(order.createdDate);
		return startDate !== undefined && endDate !== undefined ?
			(order.customer.name.toLowerCase() + order.id).includes(search.toLowerCase()) && orderDate <= endDate && orderDate >= startDate :
			(order.customer.name.toLowerCase() + order.id).includes(search.toLowerCase());
	});
	filteredOrders = filterType === '' ? filteredOrders : filteredOrders.filter((order) =>
		filterType === 'ful' ? order.fulfillmentStatus === filterStatus
			: order.billingInfo.status === filterStatus);

	const orders: any[] = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
	const pageCount = filteredOrders.length / PAGE_SIZE;
	res.send([orders, Math.ceil(pageCount)]);
});

app.get('/api/itemSearch', (req, res) => {
	const page = <number> (req.query.page || 1);
	const searchVal = <string>req.query.value;
	handleDates(
		<string>req.query.startDate,
		<string>req.query.endDate,
		req.query.resetDate
	);
	var orders: any[] = allOrders.filter(order =>
		order.items.filter(
			(item: any) => products[item.id].name.toLowerCase().includes(searchVal.toLowerCase())
		).length > 0
	);
	if (startDate !== undefined && endDate !== undefined) {
		const from = startDate;
		const to = endDate;
		orders = orders.filter(order => {
			const orderDate = new Date(order.createdDate);
			return orderDate <= to && orderDate >= from;
		})
	}
	orders = filterType === '' ? orders : orders.filter((order) =>
		filterType === 'ful' ?
			order.fulfillmentStatus === filterStatus
			: order.billingInfo.status === filterStatus
	);
	const sliceOrders: any[] = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
	const pageCount = orders.length / PAGE_SIZE;
	res.send([sliceOrders, Math.ceil(pageCount)]);
});


app.listen(port, () => console.log(`BACK_END_SERVICE_PORT: ${port}`));