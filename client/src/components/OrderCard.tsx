import React from 'react';
import { createApiClient, ItemAndQuantity, Order } from '../api';
import Modal from './Modal';
import image from './assets/package.png'

export type extendedOrder = {
    order: Order,
    showModal: boolean,
    itemsDetails: { [id: string]: itemInOrder }
}

type itemInOrder = {
    imageUrl: string,
    name: string,
    quantity: number
}

const api = createApiClient();
export default class OrderCard extends React.PureComponent<{ order: Order, getAsset: Function, onChange: Function }>{
    state: extendedOrder = {
        order: this.props.order,
        showModal: false,
        itemsDetails: {}
    };


    handleFullFillmentClick = () => {
        const newFulfullment = this.state.order.fulfillmentStatus === 'fulfilled' ? 'not-fulfilled' : 'fulfilled'
        const newOrder: Order = {
            ...this.state.order,
            fulfillmentStatus: newFulfullment
        }
        const newExtendedOrder: extendedOrder = { ...this.state, order: newOrder }
        this.setState(newExtendedOrder);
        this.props.onChange(newOrder);
    }

    fetchItemsDetails = () => {
        this.state.order.items.forEach(item => {
            api.getItem(item.id)
                .then(data => {
                    const iteminOrder: itemInOrder = {
                        imageUrl: data.image,
                        name: data.name,
                        quantity: item.quantity
                    }
                    const newItemDetails = { ...this.state.itemsDetails }
                    newItemDetails[item.id] = iteminOrder

                    this.setState({
                        ...this.state, itemsDetails: newItemDetails
                    })
                })
                .catch(err => {
                    console.log(err)
                })
        })
    }

    showModal = () => {
        if (Object.keys(this.state.itemsDetails).length === 0) {
            this.fetchItemsDetails();
        }
        const newExtendedOrder: extendedOrder = { ...this.state, showModal: true }
        this.setState(newExtendedOrder)
        return
    }

    onClose = () => {
        const newExtendedOrder: extendedOrder = { ...this.state, showModal: false }
        this.setState(newExtendedOrder)
    };
    getPictureUrl = (item: ItemAndQuantity) => {
        return this.state.itemsDetails[item.id] ? this.state.itemsDetails[item.id].imageUrl : undefined
    }

    getItemName = (item: ItemAndQuantity) => {
        return this.state.itemsDetails[item.id] ? this.state.itemsDetails[item.id].name : undefined
    }

    render() {
        return (
            <div className='orderCard' >
                <div className={'generalData'} >
                    <h6>{this.state.order.id}</h6>
                    <h4>{this.state.order.customer.name}</h4>
                    <h5>Order Placed: {new Date(this.state.order.createdDate).toLocaleDateString()}</h5>
                </div>
                <div className={'fulfillmentData'}>
                    <h4>{this.state.order.itemQuantity} Items</h4>
                    <img src={this.props.getAsset(this.state.order.fulfillmentStatus)} alt={""} />
                    {this.state.order.fulfillmentStatus !== 'canceled' &&
                        <a onClick={this.handleFullFillmentClick}>
                            Mark as {this.state.order.fulfillmentStatus === 'fulfilled' ? 'Not Delivered' : 'Delivered'}</a>
                    }
                </div>
                <div className={'paymentData'}>
                    <h4>{this.state.order.price.formattedTotalPrice}</h4>
                    <img src={this.props.getAsset(this.state.order.billingInfo.status)} alt={""} />
                </div>
                <div className="orderDeatils">
                    <h6
                        className="toggle-button"
                        id="centered-toggle-button" >
                        <button type="button"
                            className="btn toggle-btn"
                            onClick={this.showModal}>
                            More Details
                        </button>
                    </h6>
                    <Modal
                        lable='Order Details'
                        showModal={this.state.showModal}
                        onClose={this.onClose}>
                        <h4 style={{ color: "Green" }}>
                            Order Exact time : {new Date(this.state.order.createdDate).toLocaleTimeString()}</h4>
                        <br />
                        <div>
                            {
                                this.props.order.items.map(item => (<div key={item.id}>
                                    <img src={this.getPictureUrl(item)} alt={`item ${item.id}`} />
                                    {this.getItemName(item)}{" "}
                                    <h6>{item.quantity} {item.quantity !== 1 ? " Pieces" : " Piece"}</h6>
                                </div>))
                            }
                        </div>
                    </Modal>
                </div>
            </div>
        )
    }
}