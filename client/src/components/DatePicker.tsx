import React from 'react';
import Helmet from 'react-helmet';
import DayPicker from 'react-day-picker';
import 'react-day-picker/lib/style.css';
import Modal from './Modal';
import '../App.scss';

const style = `
  .Selectable .DayPicker-Day--selected:not(.DayPicker-Day--start):not(.DayPicker-Day--end):not(.DayPicker-Day--outside) {
    background-color: #f0f8ff !important;
    color: #4a90e2;
  }
  .Selectable .DayPicker-Day {
    border-radius: 0 !important;
  }
  .Selectable .DayPicker-Day--start {
    border-top-left-radius: 50% !important;
    border-bottom-left-radius: 50% !important;
  }
  .Selectable .DayPicker-Day--end {
    border-top-right-radius: 50% !important;
    border-bottom-right-radius: 50% !important;
  }
`

export type DatePickerState = {
  from: Date | undefined,
  to: Date | undefined,
  numberOfMonths: number,
  showModal: boolean,
  styleBackground: string
}

export type DatePickerProps = {
  pickerHandler: (
    filterOption?: string,
    from?: Date,
    to?: Date,
    resetDate?: boolean
  ) => void
}

export default class DatePicker extends React.Component<DatePickerProps, DatePickerState> {
  constructor(props: any) {
    super(props);

    this.handleDayClick = this.handleDayClick.bind(this);
    this.handleResetClick = this.handleResetClick.bind(this);
    this.state = this.getInitialState();
  }

  getInitialState() {
    return {
      from: undefined,
      to: undefined,
      numberOfMonths: 2,
      showModal: false,
      styleBackground: "inherit"
    };
  }

  handleDayClick(day: Date) {
    let from = this.state.from;
    let to = this.state.to;

    if (this.state.from === undefined) {
      from = day;
    }
    else if (day < this.state.from && to === undefined) {
      to = from;
      from = day;
    }
    else if (day < this.state.from) {
      from = day;
    }
    else {
      day.toLocaleDateString() === to?.toLocaleDateString() ? from = to : to = day;
    }
    this.setState({ from, to });
  }

  handleResetClick() {
    this.setState(this.getInitialState());
    this.props.pickerHandler(undefined, undefined, undefined, true);
  }

  render() {
    const { from, to } = this.state;
    const modifiers = { start: from, end: to };
    return (
      <div className="searchDate">
        <h6
          className="toggle-button"
          id="centered-toggle-button" onClick={() => this.setState({ showModal: !this.state.showModal })}>
          <button type="button"
            className="dateBtn toggle-btn" >
            Show Date Picker
                    </button>
        </h6>
        <Modal
          lable='Come on pick a date pick pick pick a Date...'
          showModal={this.state.showModal}
          onClose={() => {
            if (from === undefined || to === undefined) {
              this.setState({ from: undefined, to: undefined });
            }
            else {
              this.props.pickerHandler(undefined, from, to)
            }
            this.setState({ showModal: !this.state.showModal })
          }}>
          <div className="RangeExample">
            <p>
              {!from && !to && 'Please select the first day.'}
              {from && !to && 'Please select the last day.'}
              {from &&
                to &&
                `Selected from ${from.toLocaleDateString()} to
                  ${to.toLocaleDateString()}`}{' '}
            </p>
            <DayPicker
              className="Selectable"
              month={new Date(2020, 5)}
              numberOfMonths={this.state.numberOfMonths}
              // selectedDays={[from, { from: from as Date, to: to as Date }]}
              modifiers={modifiers}
              onDayClick={this.handleDayClick}
              todayButton={"Today"}
            />
            <Helmet>
              <style>{style}</style>
            </Helmet>
          </div>
        </Modal >
        {
          from !== undefined && to !== undefined ?
            <div style={{ display: "inline-flex" }}>
              <h5 style={{ paddingLeft: "10px", paddingRight: "10px" }}>{`Showing orders from ${from.toLocaleDateString()} to ${to.toLocaleDateString()}`}</h5>
              <button className="customBackgroundForTouch"
                style={{ background: this.state.styleBackground }}
                onMouseEnter={() => {
                  this.setState({
                    ...this.state,
                    styleBackground: "#ff0000"
                  })
                }}
                onMouseLeave={() => {
                  this.setState({
                    ...this.state,
                    styleBackground: "#FFFFFF"
                  })
                }}
                onClick={this.handleResetClick}>Reset</button>
            </div> :
            null
        }
      </div >
    );
  }
}