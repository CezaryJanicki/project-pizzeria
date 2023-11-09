import { templates, select, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.starters = [];

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.initTables();
  }

  getData() {
    const thisBooking = this;

    const startDataParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);
    const params = {
      booking: [
        startDataParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDataParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    console.log('getData params', params);

    const urls = {
      booking: settings.db.url + '/' + settings.db.bookings + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.events + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.events + '?' + params.eventsRepeat.join('&'),
    };
    console.log('urls params', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),])
      .then(function (allResponses) {
        const bookingResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        console.log('parsedResponse bookings', bookings);
        console.log('parsedResponse eventsCurrent', eventsCurrent);
        console.log('parsedResponse eventsRepeat', eventsRepeat );
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;
    thisBooking.booked = {};
    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate= minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    console.log('thisBooking.booked', thisBooking.booked);

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    console.log('2hour', hour);

    const startHour = utils.hourToNumber(hour);

    //thisBooking.booked[date][startHour].push(table);

    for (let hourBlock = startHour + 0.5; hourBlock < startHour + duration; hourBlock += 0.5) {
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }

  }

  updateDOM() {
    const thisBooking = this;
    thisBooking.date = thisBooking.datePicker.correctValue;

    console.log('thisBooking.hourpicker.value', thisBooking.hourPicker.value);
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    console.log('thisBooking.hour', thisBooking.hour);
    console.log('thisBooking.date', thisBooking.date);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) //> -1
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }

  }


  render(element) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();

    thisBooking.element = utils.createDOMFromHTML(generatedHTML);

    const bookingContainer = document.querySelector(select.containerOf.booking);

    bookingContainer.appendChild(thisBooking.element).innerHTML;

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    console.log('booking dom' + thisBooking.dom); // Check if thisBooking.dom is defined
    console.log('people amount dom' + thisBooking.dom.peopleAmount); // Check if thisBooking.dom.peopleAmount is defined

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.peopleAmount
    );

    console.log('people amount dom ' + thisBooking.dom.peopleAmount); // Check if thisBooking.dom.peopleAmount is defined
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.hoursAmount
    );
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.datePicker.wrapper
    );
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.hourPicker.wrapper
    );
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(
      select.booking.tables
    );
    thisBooking.dom.allTables = thisBooking.dom.wrapper.querySelector(
      select.booking.allTables
    );
    thisBooking.dom.formButton = element.querySelector(
      select.booking.formButton
    );
    thisBooking.dom.phone = element.querySelector(select.booking.phone);
    thisBooking.dom.address = element.querySelector(select.booking.address);
    thisBooking.dom.starters = element.querySelector(select.booking.starters);
  }
  initWidgets() {
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(
      thisBooking.dom.peopleAmount
    );
    thisBooking.hoursAmount = new AmountWidget(
      thisBooking.dom.hoursAmount
    );

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();

      for (let table of thisBooking.dom.tables) {
        table.classList.remove(classNames.booking.tableSelected);
      }
    });
    thisBooking.dom.formButton.addEventListener('submit', function (event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });
    thisBooking.dom.starters.addEventListener('click', function (event) {
      const starter = event.target;

      if (starter.type == 'checkbox') {
        if (starter.checked == true) {
          thisBooking.starters.push(starter.value);
        } else {
          thisBooking.starters.splice(
            thisBooking.starters.indexOf(starter.value)
          );
        }
      }
      console.log('thisBooking.starters', thisBooking.starters);
    });
  }

  sendBooking() {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.bookings;

    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: thisBooking.tableId,
      duration: parseInt(thisBooking.hoursAmount.value),
      ppl: parseInt(thisBooking.peopleAmount.value),
      starters: thisBooking.starters,
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    };



    //console.log('payload', payload);

    const options = {
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    //
    fetch(url, options)
      .then(function (response) {
        return response.json();
      })
      .then(function (parsedResponse) {
        thisBooking.makeBooked(
          parsedResponse.date,
          parsedResponse.hour,
          parsedResponse.duration,
          parsedResponse.table
        );
      });
    console.log('thisbooking.booked', thisBooking.booked);

  }

  initTables() {
    const thisBooking = this;
    thisBooking.dom.allTables.addEventListener('click', function (event) {
      event.preventDefault();
      const clickedElement = event.target;

      console.log('clickedElement', clickedElement);

      const tableId = clickedElement.getAttribute(
        settings.booking.tableIdAttribute
      );
      thisBooking.tableId = parseInt(tableId);


      if (tableId != null) {
        if (!clickedElement.classList.contains(classNames.booking.tableBooked)) {
          const tables = thisBooking.element.querySelectorAll(
            select.booking.tables
          );
          if (
            !clickedElement.classList.contains(classNames.booking.tableSelected)
          ) {
            for (let table of tables) {
              table.classList.remove(classNames.booking.tableSelected);
            }
            clickedElement.classList.toggle(classNames.booking.tableSelected);
          } else {
            clickedElement.classList.toggle(classNames.booking.tableSelected);
          }
        } else {
          alert('table unavailable');
        }
      }
    });
  }
}


export default Booking;
