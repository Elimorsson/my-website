import React, { Component } from 'react';
import './App.css';
import { createApiClient, Order } from './api';
import OrderCard from './components/OrderCard';
import DatePicker from "./components/DatePicker";
import { Pagination } from '@material-ui/lab/';
import { Switch, FormControlLabel, FormControl, FormLabel, Radio, RadioGroup } from '@material-ui/core/';
import "react-datepicker/dist/react-datepicker.css";

const api = createApiClient();
const PAGE_SIZE = 20;

const FILTER_NAMES = [
	"All",
	"Fulfilled",
	"Not-Fulfilled",
	"Canceled",
	"Paid",
	"Not-Paid",
	"Refunded"
];



export type AppState = {
  orders?: Order[],
  search: string,
  page: number,
  pageQuantity: number,
  searchResults: Order[],
  filterStatus: string;
  nonDeliveredOrders?: number,
  itemSearch: boolean;
  index: number;
  startDate?: Date;
  endDate?: Date;
  response?: "";
}


class App extends React.PureComponent<{}, AppState> {
  state: AppState = {
    search: '',
    page: 1,
    pageQuantity: 1,
    searchResults: [],
    filterStatus: "All",
    itemSearch: false,
    index: 0,
    response: ""
  };

  searchDebounce: any = null;



  async componentDidMount() {
    // //old---
    // axios.get(`/api/v1/say-somthing`).then((res) => {
    //   const response = res.data.answer;
    //   this.setState({ response });
    // });
    this.sendFilterRequest = this.sendFilterRequest.bind(this);
    this.getNonDeliveredQuantity();
    const ans = await api.getOrders(this.state.page, "All", undefined, undefined, true);
    this.setState({
      orders: ans[0],
      pageQuantity: ans[1],
    });
  }
  getNonDeliveredQuantity() {
    api.getNonDeliveredQuantity().then(data => this.setState({
      ...this.state,
      nonDeliveredOrders: data[0]
    }))
  }

  // Server request function -- 
  // ask for Orders from server, depend on which filter button is pressed (filterOption) and what dates are provided (from,tp,reset)
  // the reset button initialize the dates
  async sendFilterRequest(filterOption?: string, from?: Date, to?: Date, resetDate?: boolean) {
    if (this.state.search !== "") {
      const ans = this.state.itemSearch ?
        await api.getItemSearch(this.state.search, undefined, from, to, resetDate) :
        await api.getSearch(this.state.search, undefined, from, to, resetDate);
      this.setState({
        ...this.state,
        searchResults: ans[0],
        page: 1,
        pageQuantity: ans[1],
      });
    }
    else {
      const ans = await api.getOrders(undefined, filterOption, from, to, resetDate);
      this.setState({
        ...this.state,
        orders: ans[0],
        page: 1,
        pageQuantity: ans[1],
      });
    }
  }


  onItemSearch(e: React.ChangeEvent<HTMLInputElement>, checked: boolean) {
    this.setState({
      ...this.state,
      itemSearch: !this.state.itemSearch
    })
  }

  onSearch = async (value: string, newPage?: number) => {

    clearTimeout(this.searchDebounce);

    this.searchDebounce = setTimeout(async () => {
      this.setState({
        ...this.state,
        search: value
      });
      if (value.length > 0) {
        const results = this.state.itemSearch ? await api.getItemSearch(this.state.search) : await api.getSearch(this.state.search);
        this.setState({
          ...this.state,
          searchResults: results[0],
          page: 1,
          pageQuantity: results[1],
        });
      }
    }, 1000);
  };

  // function to handle when click on "mark as Delivery/Not Delivery button"
  handleUpdateFulfillment = (newOrder: Order) => {
    const newOrders = this.state.orders;
    const searchOrders = this.state.searchResults;
    const nonDelivered = this.state.nonDeliveredOrders ?? 0;
    if (newOrders !== undefined) {
      if (this.state.filterStatus !== "All") {
        newOrders.splice(newOrders.findIndex((order) => order.id === newOrder.id), 1);
        searchOrders.splice(searchOrders.findIndex((order) => order.id === newOrder.id), 1);
      }
      const newPageQuantity = newOrders.length === 0 ? this.state.pageQuantity - 1 : this.state.pageQuantity;
      this.setState({
        ...this.state,
        orders: newOrders,
        searchResults: searchOrders,
        nonDeliveredOrders: newOrder.fulfillmentStatus === "fulfilled" ? nonDelivered - 1 : nonDelivered + 1,
        pageQuantity: newPageQuantity
      });
    }
    api.setFulfilment(newOrder.id);
  }

  handleChangePage = async (newPage: number) => {
    const ans = this.state.search.length === 0 ?
      await api.getOrders(newPage) :
      this.state.itemSearch ?
        await api.getItemSearch(this.state.search, newPage) :
        await api.getSearch(this.state.search, newPage);
    this.setState({
      ...this.state,
      orders: this.state.search.length === 0 ? ans[0] : this.state.orders,
      searchResults: this.state.search.length === 0 ? this.state.searchResults : ans[0],
      page: newPage
    });
  }

  showingResult() {
    const pageResult = this.state.search.length === 0 ?
      `${PAGE_SIZE * (this.state.page - 1) + 1} - ${PAGE_SIZE * this.state.page}` :
      `${20 * (this.state.page - 1) + 1} - ${20 * (this.state.page - 1) + this.state.searchResults.length} of ${20 * this.state.pageQuantity}`
    return `Showing ${pageResult} results`;
  }

  renderOrders = (orders: Order[]) =>
    orders.map((order) =>
      <OrderCard
        key={order.id}
        order={order}
        getAsset={App.getAssetByStatus}
        onChange={this.handleUpdateFulfillment}
      />
    );



  render() {
    var orders = this.state.search.length === 0 ? this.state.orders : this.state.searchResults;
    return (
      <main>
        <h1>Orders</h1>
        <h3 className="nonDeliverTitle">Number of non delivered orders: {this.state.nonDeliveredOrders ?? "Fetching..."}</h3>
        <header>
          <input key={this.state.index} type="search" placeholder="Search" onChange={(e) => { this.onSearch(e.target.value) }} />
          <br />
          <h3 className='searchDate'>
            <DatePicker pickerHandler={this.sendFilterRequest} />
          </h3>
        </header>
        <div className='searchFilters'>
          <FormControl component="fieldset">
            <FormLabel component="legend" className="display-mode">Display Modes</FormLabel>
            <RadioGroup row aria-label="position" name="position" defaultValue="All"
              onChange={(e) => {
                const status = e.target.value.toString();
                this.setState({
                  ...this.state,
                  filterStatus: status,
                  search: '',
                  itemSearch: false,
                  index: this.state.index + 1
                }, () => {
                  this.sendFilterRequest(status);
                });

              }
              }>
              {FILTER_NAMES.map((name) => <FormControlLabel
                key={name}
                value={name}
                control={<Radio color="primary" />}
                label={name}
                labelPlacement="bottom"
              />)}
            </RadioGroup>
          </FormControl>
          <FormControlLabel
          className="item-search"
            control={
              <Switch
                checked={this.state.itemSearch}
                onChange={(e, checked) => {
                  this.setState({
                    ...this.state,
                    itemSearch: !this.state.itemSearch
                  })
                  this.onSearch(this.state.search);
                }}
                name="itemSearch" />}
            label="Item search"
          />
        </div>
        { orders ? <div className='results'>{this.showingResult()}</div> : null}
        { orders ? <div className='orders'>{this.renderOrders(orders)}</div> : <h2>Loading...</h2>}
        {
          //this.state.search.length === 0 ?
          <Pagination
            count={this.state.pageQuantity}
            color="primary"
            page={this.state.page}
            onChange={(e, page) => this.handleChangePage(page)} />
          //: null
        }
      </main >
    )
  }
  
  static getAssetByStatus(status: string) {
		switch (status) {
			case 'fulfilled':
				return package_png;
			case 'not-fulfilled':
				return pending_png;
			case 'canceled':
				return cancel_png;
			case 'paid':
				return paid_png;
			case 'not-paid':
				return not_paid_png;
			case 'refunded':
				return refunded_png;
		}
	}
}
import package_png from './assets/package.png';
import pending_png from './assets/pending.png';
import cancel_png from './assets/cancel.png';
import paid_png from './assets/paid.png';
import not_paid_png from './assets/not-paid.png';
import refunded_png from './assets/refunded.png';

export default App;