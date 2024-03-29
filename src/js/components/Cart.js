import {settings, select, classNames, templates} from './../settings.js';
import {utils} from './../utils.js';
import CartProduct from './CartProduct.js';


class Cart {
  constructor(element) {
    const thisCart = this;
    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
    // console.log('new Cart; ', thisCart);
  }
  getElements(element) {
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(
      select.cart.toggleTrigger
    );
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(
      select.cart.productList
    );
    thisCart.renderTotalsKeys = [
      'totalNumber',
      'totalPrice',
      'subtotalPrice',
      'deliveryFee',
    ];
    for (let key of thisCart.renderTotalsKeys) {
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(
        select.cart[key]
      );
    }
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
  }
  initActions() {
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function () {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(){
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });
  }
  add(menuProduct) {
    const thisCart = this;

    if (menuProduct) {
      // Generate HTML based on template
      const generatedHTML = templates.cartProduct(menuProduct);
      // Create an element using utils.createElementFromHTML
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);

      // Add the element to the menu
      thisCart.dom.productList.appendChild(generatedDOM);

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      console.log('thisCart.products', thisCart.products);
      thisCart.update();
      console.log('menuProduct:', menuProduct);
    } else {
      console.error('menuProduct is undefined. Product cannot be added to the cart.');
    }

  }
  update() {
    const thisCart = this;
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    for (const product of thisCart.products) {
      thisCart.subtotalPrice += product.price;
      thisCart.totalNumber += product.amount;
    }
    if (!thisCart.totalNumber) {
      thisCart.deliveryFee = 0;
    }
    thisCart.totalPrice = thisCart.subtotalPrice  + thisCart.deliveryFee;

    console.log(
      'this cart numbers: ',
      thisCart.totalNumber,
      thisCart.subtotalPrice,
      thisCart.totalPrice,
      thisCart.deliveryFee
    );
    for(let key of thisCart.renderTotalsKeys){
      for(let elem of thisCart.dom[key]){
        elem.innerHTML = thisCart[key];
      }
    }

  }
  remove(cartProduct) {
    const thisCart = this;

    const index = thisCart.products.indexOf(cartProduct);
    thisCart.products.splice(index, 1);
    cartProduct.dom.wrapper.remove();
    thisCart.update();
  }

  sendOrder() {
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.orders;

    const payload = {
      phone: thisCart.dom.phone.value,
      address: thisCart.dom.address.value,
      totalNumber: thisCart.totalNumber,
      subtotalprice: thisCart.subtotalPrice,
      totalprice: thisCart.subtotalPrice,
      deliverFee: thisCart.deliveryFee,
      products: [],
    };
    for (const prod of thisCart.products) {
      prod.getData();
      payload.products.push(prod.getData());
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsed response: ', parsedResponse);
      });
  }
}

export default Cart;