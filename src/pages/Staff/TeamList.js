import React, { Component } from 'react';
import { connect } from 'dva';

import { Form, Row, Col, Card, Button, Table, Input, Popconfirm, message } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './StaffList.less';

import { queryTeams } from '@/services/sh';

function getColumns(operations) {

    const columns = [
      {
        title: formatMessage({id: 'sh.team_name', defaultMessage: 'Organization name'}),
        dataIndex: 'name',
      },
      {
        title: formatMessage({id: 'sh.higher level organization', defaultMessage: 'Higher level organization'}),
        dataIndex: 'pname',
      },
      {
        title: formatMessage({id: 'sh.team_level', defaultMessage: 'Organization level'}),
        dataIndex: 'level',
      },

    ];

    return columns
}

class TeamList extends Component {
  state = {
    teams: [],
  }

  componentDidMount() {

        queryTeams().then(response => {
            this.setState({
              teams: response.result.data1,
            })
        })
}

  render() {
    const {teams} = this.state

    return (
      <PageHeaderWrapper>
        <Card>
          <div className={styles.tableList}>
           
            <Table 
              dataSource={teams}
              columns={getColumns()}
              rowKey="id"
            
            />
          </div>
        </Card>     
     </PageHeaderWrapper>
    );
  }
}

export default TeamList;


