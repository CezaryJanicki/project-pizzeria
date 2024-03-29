import AmountWidget from './AmountWidget.js';
import {select} from './../settings.js';


class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;
    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.priceSingle =  menuProduct.priceSingle;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.params = menuProduct.params;
    console.log('menuProduct.params:', menuProduct.params);
    thisCartProduct.paramsJSON = JSON.parse(JSON.stringify(menuProduct.params));
    console.log('thisCartProduct.paramsJSON:', thisCartProduct.paramsJSON);
    console.log('menuProduct:', menuProduct);

    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    console.log('new CartProduct; ', thisCartProduct);
    thisCartProduct.initActions();
  }
  getElements(element){
    const thisCartProduct = this;

    thisCartProduct.dom = {};

    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
  }
  initAmountWidget() {
    const thisCartProduct = this;
    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
    thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
      console.log('thisCartProduct price is: ', thisCartProduct.price);
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
    });
  }
  remove() {
    const thisCartProduct = this;
    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });
    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }
  initActions() {
    const thisCartProduct = this;
    thisCartProduct.dom.edit.addEventListener('click', function(event) {
      event.preventDefault();
    });
    thisCartProduct.dom.remove.addEventListener('click', function(event) {
      event.preventDefault();
      thisCartProduct.remove();
      console.log('cart products was removed!)');
    });
  }
  getData() {
    const thisCartProduct = this;
    const productData = {
      id: thisCartProduct.id,
      price: thisCartProduct.price,
      priceSingle: thisCartProduct.priceSingle,
      amount: thisCartProduct.amount,
      params: thisCartProduct.params,
    };
    return productData;
  }
}

export default CartProduct;
