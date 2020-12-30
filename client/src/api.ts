import axios from 'axios';

export type Customer = {
	name: string;
	id?: string;
}

export type BillingInfo = {
	status: string;
}

export type Price = {
	total?: number;
	formattedTotalPrice: string;
}

export type Order = {
	id: number;
	currency?: string;
	createdDate: string;
	itemQuantity: number;
	items: ItemAndQuantity[];
	customer: Customer;
	fulfillmentStatus: string;
	billingInfo: BillingInfo;
	price: Price;
}

export type ItemAndQuantity = {
	id: string,
	quantity: number
}

export type Item = {
	id: string;
	name: string;
	price: number;
	image: string;
}

export type ApiClient = {
	getOrders: (newPage?: number, filterOption?: string, startDate?: Date, endDate?: Date, resetDate?: boolean) => Promise<any[]>;
	getItem: (itemId: string) => Promise<Item>;
	setFulfilment: (orderId: number) => void;
	getNonDeliveredQuantity: () => Promise<number[]>;
	getSearch: (searchValue: string, newPage?:number, startDate?: Date, endDate?: Date, resetDate?: boolean) => Promise<any[]>;
	getItemSearch: (searchVal: string, newPage?:number, startDate?: Date, endDate?: Date, resetDate?: boolean) => Promise<any[]>;
}
var env = process.env.NODE_ENV || 'development'
const API_ADDRESS = env === 'production' ? 'https://web-orders-app.herokuapp.com' : 'http://localhost:5000';

export const createApiClient = (): ApiClient => {
	return {
		getOrders: (newPage?: number, filterOption?: string, startDate?: Date, endDate?: Date, resetDate?: boolean) => {
			return axios.get(`${API_ADDRESS}/api/orders`,
				{
					params:
					{
						page: newPage,
						filterOption,
						startDate,
						endDate,
						resetDate
					}
				})
				.then((res) => res.data);

		},
		getItem: (itemId: string) => {
			return axios.get(`${API_ADDRESS}/api/items/${itemId}`).then((res) => res.data);
		},
		setFulfilment: (orderId: number) => {
			axios.post(`${API_ADDRESS}/api/orders/${orderId}`);
		},
		getNonDeliveredQuantity: () => {
			return axios.get(`${API_ADDRESS}/api/count`).then((res) => res.data);
		},
		getSearch: (searchValue: string, newPage?:number, startDate?: Date, endDate?: Date, resetDate?: boolean) => {
			return axios.get(`${API_ADDRESS}/api/search`,
				{
					params:
					{
						search: searchValue,
						page: newPage,
						startDate,
						endDate,
						resetDate
					}
				})
				.then((res) => res.data);
		},
		getItemSearch: (searchVal: string, newPage?:number, startDate?: Date, endDate?: Date, resetDate?: boolean) => {
			return axios.get(`${API_ADDRESS}/api/itemSearch`, {
				params: {
					value: searchVal,
					page: newPage,
					startDate,
					endDate,
					resetDate
				}
			}).then((res) => res.data);
		}
	}
};



