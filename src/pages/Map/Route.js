import React, { Component } from 'react';

import { connect } from 'dva';

import { Select, DatePicker, Button, Cascader } from 'antd';

@connect(({ monitor, route }) => ({
  monitor,
  route,
}))
class Route extends Component {
  constructor(props) {
    super(props);
    this.changePerson = this.changePerson.bind(this);
    this.changeDatetime = this.changeDatetime.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.changePlace = this.changePlace.bind(this);
  }

  changePerson(person) {
    const { dispatch } = this.props;
    dispatch({
      type: 'route/changePerson',
      payload: person,
    });
  }

  changeDatetime(datetime) {
    const { dispatch } = this.props;
    dispatch({
      type: 'route/changeDatetime',
      payload: datetime,
    });
  }

  handleSearch() {
    const {
      dispatch,
      route: { person, datetime },
    } = this.props;

    dispatch({
      type: 'route/fetchRoutes',
      payload: {
        person,
        datetime,
      },
    });
  }

  changePlace(place) {
    const { dispatch } = this.props;
    dispatch({
      type: 'route/changePlace',
      payload: place,
    });
  }

  render() {
    const {
      monitor: { people },
      route: { person, datetime, places, place },
    } = this.props;

    return (
      <div>
        <Select
          style={{ width: '178px' }}
          placeholder="请选择人员"
          allowClear
          onChange={this.changePerson}
          value={person}
        >
          {people.map(p => (
            <Select.Option key={p.id} id={p.id}>
              {p.name}
            </Select.Option>
          ))}
        </Select>
        <br />
        <DatePicker.RangePicker
          showTime={{ format: 'HH:mm:ss' }}
          onChange={this.changeDatetime}
          value={datetime}
        />
        <br />
        <Button type="primary" onClick={this.handleSearch}>
          查询
        </Button>
        <br />
        <Cascader
          options={places}
          value={place}
          onChange={this.changePlace}
          placeholder="请选择地址"
        />
      </div>
    );
  }
}

export default Route;
