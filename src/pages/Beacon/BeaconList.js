import React, { Component } from 'react';
import { connect } from 'dva';
import { Table,Button,Card , Modal,Form,Input,Popconfirm,Dropdown,Menu} from 'antd';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './BeaconList.less';


const columns = [
  {
    title: '信标Sn',
    dataIndex: 'mac',
  },
  {
    title: '姓名',
    dataIndex: 'name',
  },
  {
    title: '工号',
    dataIndex: 'number',
  },
  {
    title: '电量',
    dataIndex: 'battery',
  },
  {
    title: '强度',
    dataIndex: 'rssi',
  },
  
  {
    title: '操作',
    dataIndex: 'operation',
    render: (text, record) =>     
        <Popconfirm title="确定删除?" onConfirm={() => this.handleDelete(record.key)}>
          <a>删除</a>
        </Popconfirm>     
  },
];


@connect(({ table }) => ({
  table,
}))
class BeaconList extends Component {

  constructor(props){
    super(props) 
    this.changeInputValue= this.changeInputValue.bind(this)  
    this.clickBtn = this.clickBtn.bind(this)
 
}

  render() {
    const {
      table: { beaconlist },
    } = this.props;

    const {inputValue} = this.props;


    // const MoreBtn = props => (
    //   <Dropdown
    //     overlay={
    //       <Menu onClick={({ key }) => editAndDelete(key, props.current)}>
    //         <Menu.Item key="edit">编辑</Menu.Item>
    //         <Menu.Item key="delete">删除</Menu.Item>
    //       </Menu>
    //     }
    //   >
    //     <a>
    //       更多 <Icon type="down" />
    //     </a>
    //   </Dropdown>
    // );

    return (
      <PageHeaderWrapper>
        <div className={styles.standardList}>
    
          <Input 
            placeholder='请输入信标值'
            style={{ width:'250px', marginRight:'10px'}}
            onChange={this.changeInputValue}
          />
          <Button 
            type="primary"
            onClick={this.clickBtn}
            >增加</Button>            
          <Table 
            dataSource={beaconlist}
            columns={columns}
            rowKey="id"
          />
        </div>

     </PageHeaderWrapper>
    );
  }



  changeInputValue(e){
    console.log(e.target.value)
  }
  clickBtn(){

    console.log('hjkl')
    // const { dispatch } = this.props;

    // dispatch({
    //   type: 'add/beacon',
    //   payload,
    // });
 }


 handleDelete = key => {
  const dataSource = [...this.state.dataSource];
  this.setState({
    dataSource: dataSource.filter(item => item.key !== key),
  });
};
}

export default BeaconList;

