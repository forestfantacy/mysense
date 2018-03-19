import React from 'react';
import ReactDOM from 'react-dom';
import { Row, Col, Input, Checkbox, Button, Table, Modal, notification, InputNumber, Select, Dropdown, Menu,Tooltip } from 'antd';
import { Form, FormItem } from "../components/Form";
import styles from "../styles/dataOper.less";
import { request } from "../common/utils/request";
import qs from "qs";


const Search = Input.Search;
const InputGroup = Input.Group;
const Option = Select.Option;
const { TextArea } = Input;
const EditableCell = ({ editable, value, onChange }) => (
  <div>
        {editable
            ? <Input style={{ margin: '-5px 0' }} value={value} onChange={e => onChange(e.target.value)} />
            : value
        }
    </div>
);


const formProps = {
  labelCol: {
    span: 4
  },
  wrapperCol: {
    span: 20
  }
}

const RIGHTMENUS = (
  <Menu>
        <Menu.Item key="1">1st menu item</Menu.Item>
        <Menu.Item key="2">2nd menu item</Menu.Item>
        <Menu.Item key="3">3rd menu item</Menu.Item>
    </Menu>
);

export default class DataOPeration extends React.Component {

  constructor(props, context) {
    super(props, context);

    let pathname = this.props.location.pathname;
    let appId = Number.parseInt(pathname.substr(pathname.lastIndexOf('/') + 1));
    this.state = {
      total: 0,
      valueTotal: 0,
      appId: appId,
      searchType: 0,
      keyList: [],
      valueList: [],
      selectedKeys1: [],
      selectedRows: [],
      selectedKeys2: [],
      cursors: [],
      cursorsRight: [],
      visibleTTL: false,
      visibleAdd: false,
      keyTypes: [],
      detailInfo: {},
      loading: false,
      loading1: false,
      selectKeyRow: null,
      pageInfo: {
        pageNum: 1,
        pageSize: 50
      },
      pageInfoRight: {
        pageNum: 1,
        pageSize: 50
      }
    }
    this.queryConditon1 = {
      keyword: '',
      accurate: 0
    }
    this.queryConditon2 = {
      keyword: ''
    }
    this.state.cursors[1] = 0;
    this.state.cursorsRight[1] = 0;
  }

  componentWillMount() {
    this.getDefail();
    this.getKeyList();
    this.getKeyTypes();
  }

  getKeyTypes() {
    request(`/dataOperation/getKeyTypes`, {}).then((data) => {
      if (data.success) {
        const res = data.data;
        this.setState({
          keyTypes: res.data
        });
      }
    });
  }

  getKeyList() {
    const pageInfo = this.state.pageInfo;
    const cursors = this.state.cursors;
    console.log(cursors);
    let params = {
      ...this.queryConditon1,
      pageNum: pageInfo.pageNum,
      pageSize: pageInfo.pageSize ? pageInfo.pageSize : 50,
      appId: this.state.appId,
      cursor: cursors[pageInfo.pageNum]
    }
    console.log(params);
    this.setState({
      loading: true
    });
    request(`/dataOperation/getKeyList?${qs.stringify(params)}`, {}).then((data) => {
      if (data.success) {
        const res = data.data;
        // console.error(res.page.pageNum);
        this.state.cursors[cursors.length] = res.page.cursor;
        console.error(this.state.total);
        res.page.total = this.state.total;
        this.setState({
          keyList: res.data,
          pageInfo: {
            ...res.page,
            // current: cursors.length//res.page.pageNum
          }
        });
      }
      this.setState({
        loading: false
      });
    });
  }

  getValueList() {
    const state = this.state;
    const cursorsRight = this.state.cursorsRight;
    const pageInfo = state.pageInfoRight,
      selectKeyRow = state.selectKeyRow;
    if (!selectKeyRow) {
      return;
    }
    let params = {
      keyType: selectKeyRow.keyType,
      keyName: selectKeyRow.keyName,
      keyId: selectKeyRow.id,
      searchType: state.searchType,
      ...this.queryConditon2,
      pageNum: pageInfo.pageNum,
      pageSize: pageInfo.pageSize ? pageInfo.pageSize : 50,
      cursor: cursorsRight[pageInfo.pageNum]
    }
    this.setState({
      loading1: true
    });
    console.error(params);
    request(`/dataOperation/getValueList?${qs.stringify(params)}`, {}).then((data) => {
      if (data.success) {
        const res = data.data;
        this.state.cursorsRight[cursorsRight.length] = res.page.cursor;
        let valueTotal = this.state.valueTotal;
        res.page.total = valueTotal;
        this.setState({
          valueList: res.data,
          pageInfoRight: {
            ...res.page,
            current: res.page.pageNum
          }
        });
      }
      this.setState({
        loading1: false
      });
    });
  }

  getValueListTotal() {
    const state = this.state,
      selectKeyRow = state.selectKeyRow;
    if (!selectKeyRow) {
      return;
    }
    let params = {
      keyType: selectKeyRow.keyType,
      keyName: selectKeyRow.keyName,
      keyId: selectKeyRow.id,
    }
    request(`/dataOperation/getValueListTotal?${qs.stringify(params)}`, {}).then((data) => {
      if (data.success) {
        console.error(data)
        const valueTotal = data.data;
        this.setState({
          valueTotal: valueTotal,
        });
      }
    });
  }


  getDefail() {
    let params = {
      appId: this.state.appId
    };
    request(`/dataOperation/getDetail?${qs.stringify(params)}`, {}).then((data) => {
      if (data.success) {
        const res = data.data;
        this.setState({
          detailInfo: res.data,
          total: res.data.total
        });
      }
    });
  }

  /**
   * [description]
   * @param  {[type]} e [修改过期时间]
   * @return {[type]}   [description]
   */
  handerClickSaveExpireTime = (e) => {
    const state = this.state,
      selectKeyRow = state.selectKeyRow;
    this.refs.expireTimeForm.validateFields((err, p) => {
      if (!err) {
        let params = {
          ...p,
          keyId: selectKeyRow.id,
        }
        var formData = new FormData();
        for (var name in params) {
          formData.append(name, params[name]);
        }
        request(`/dataOperation/saveExpireTime`, {
          method: 'POST',
          body: formData
        }).then((data) => {
          if (data.success) {
            this.getKeyList();
            notification.info({
              message: '提示',
              description: "修改成功"
            });
          }
        });
      }
    });
  }

  handlerOnChange = (e) => {
    this.queryConditon1.accurate = e.target.checked ? 1 : 0;
  }

  getRightCols() {
    let cols = []
    const state = this.state,
      selectKeyRow = state.selectKeyRow;
    console.log(selectKeyRow.keyType);
    switch (selectKeyRow.keyType) {
      case 'zset':
        cols = [{
          title: "score",
          dataIndex: "score"
        }, {
          title: "value",
          dataIndex: "value"
        }];
        break;
      case 'hash':
        cols = [{
          title: "field",
          dataIndex: "field"
        }, {
          title: "value",
          dataIndex: "value"
        }];
        break;
      case 'set':
        cols = [{
          title: "value",
          dataIndex: "value"
        }];
        break;
      case 'list':
        cols = [{
          title: "field",
          dataIndex: "field"
        }, {
          title: "value",
          dataIndex: "value"
        }];
        break;
    }
    return cols;
  }

  renderColumns(text, record, column) {
    return (
      <EditableCell
                editable={record.editable}
                value={text}
                onChange={value => this.handleEditTableChange(value, record, column)}
            />
    );
  }

  handleEditTableChange(value, record, column) {
    const newData = [...this.state.valueList];
    const target = newData.filter(item => record.id === item.id)[0];
    if (target) {
      target[column] = value;
      this.setState({ valueList: newData });
    }
  }


  handerValueAdd = (e) => {
    const newData = [...this.state.valueList],
      newId = +new Date();
    let insertData;
    if (newData.length > 0) {
      insertData = {
        ...newData[0]
      };
      for (let n in insertData) {
        insertData[n] = '';
      }
      insertData.id = newId;
      insertData.editable = true;
    } else {
      insertData = {
        id: newId,
        editable: true
      };
    }
    newData.unshift(insertData);
    this.setState({ valueList: newData });
  }

  getViewHeight(doc) {
    var doc = document || doc,
      client = doc.compatMode == 'BackCompat' ? doc.body : doc.documentElement;
    return client.clientHeight;
  }

  getRightEditor() {
    const state = this.state,
      selectKeyRow = state.selectKeyRow,
      clientHeight = this.getViewHeight();
    if (selectKeyRow.keyType != "String") {
      const cols = this.getRightCols();
      cols.forEach((col) => {
        col.render = (text, record) => this.renderColumns(text, record, col.dataIndex);
      })
      const tableProps = {
        rowKey: "id",
        columns: cols,
        dataSource: state.valueList,
        size: "small",
        bordered: 1,
        scroll: { y: clientHeight - 308 },
        loading: this.state.loading1,
        style: {
          border: 0
        },
        onRowClick: (record) => {
          const newData = [...this.state.valueList];
          newData.forEach((item) => {
            if (record.id === item.id) {
              item.editable = true;
            } else {
              item.editable = false;
            }
          });
          this.setState({ data: newData });
        },
        rowSelection: {
          type: "checkbox",
          onChange: (selectedRowKeys, selectedRows) => {
            this.setState({
              selectedKeys2: selectedRowKeys
            })
          }
        },
        onChange: (page) => {
          let pageInfo = this.state.pageInfoRight;
          pageInfo.pageNum = page.current;
          this.setState({
            pageInfoRight: {
              ...pageInfo
            }
          }, () => {
            this.getValueList();
          })
        },
        pagination: {
          ...this.state.pageInfoRight
        }
      }
      return (
        <Table {...tableProps}></Table>
      )
    } else {
      return (
        <div style={{'padding':'20px'}}>
                    <Form layout="horizontal" ref="valueForm">
                        <Form.Item label="" key='value'>
                            <TextArea style={{height:clientHeight-285,'resize':'none'}} form={{id:'value',initialValue:selectKeyRow.value,rules:[{required: true, message: '请输入值'}]}}></TextArea>
                        </Form.Item>
                    </Form>
                </div>
      )
    }
  }

  handerSearchType = (e) => {
    this.setState({
      searchType: this.state.searchType ? 0 : 1
    })
  }

  handerSetKeys = (e) => {
    this.setState({
      visibleTTL: true
    });
  }

  handerDelKeys = (e) => {
    const selectedKeys1 = this.state.selectedKeys1;
    const selectKeyRows = this.state.selectedRows;
    let keyNameArray = [];
    for (var i = 0; i < selectKeyRows.length; i++) {
      keyNameArray.push(selectKeyRows[i].keyName)
    }
    if (selectedKeys1.length > 0) {
      Modal.confirm({
        title: "提示",
        content: "确认删除？",
        onOk: () => {
          let params = {
            keyIds: selectedKeys1.join(","),
            keyNames: keyNameArray.join(",")
          }
          var formData = new FormData();
          for (var name in params) {
            formData.append(name, params[name]);
          }
          request(`/dataOperation/deleteKeys`, {
            method: 'POST',
            // headers: { 'Content-Type': 'application/json' },
            body: formData
          }).then((data) => {
            if (data.success) {
              this.getKeyList();
              notification.info({
                message: '提示',
                description: "删除成功"
              });
            }
          });
        },
        onCancel: () => {

        }
      })
    }
  }

  handerDelScore = (e) => {
    const selectedKeys2 = this.state.selectedKeys2;
    if (selectedKeys2.length > 0) {
      Modal.confirm({
        title: "提示",
        content: "确认删除？",
        onOk: () => {
          let params = {
            keyIds: selectedKeys2.join(",")
          }
          request(`/dataOperation/deleteValues`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
          }).then((data) => {
            if (data.success) {
              this.getValueList();
              notification.info({
                message: '提示',
                description: "删除成功"
              });
            }
          });
        },
        onCancel: () => {

        }
      })
    }
  }

  handlerSaveRecord = (e) => {
    const state = this.state,
      valueList = state.valueList,
      selectKeyRow = state.selectKeyRow;

    let params = {
      keyId: selectKeyRow.id,
      valueList: JSON.stringify(valueList)
    }
    if (selectKeyRow.keyType == "String") {
      this.refs.valueForm.validateFields((err, p) => {
        if (!err) {
          params = {
            keyId: selectKeyRow.id,
            ...p
          }
        } else {
          return;
        }
      });
    }

    request(`/dataOperation/saveValues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    }).then((data) => {
      if (data.success) {
        this.getValueList();
        notification.info({
          message: '提示',
          description: "提交成功"
        });
      }
    });
  }


  handerSearch1 = (v) => {
    if (v) {
      this.queryConditon1.keyword = v;
      this.getKeyList();
    }
  }

  handerSearch2 = (v) => {
    if (v) {
      this.queryConditon2.keyword = v;
      this.getValueList();
    }
  }

  handerScoreChange = (v, name) => {
    this.queryConditon2[name] = v;
  }
  handerAddKey = (e) => {
    if (this.refs.addForm) {
      this.refs.addForm.resetFields();
    }
    this.setState({
      visibleAdd: true
    })
  }

  handerSearchRight = (e) => {
    this.getValueList();
  }

  saveTTL() {
    const selectedKeys1 = this.state.selectedKeys1;
    const selectKeyRows = this.state.selectedRows;
    let keyNameArray = [];
    for (var i = 0; i < selectKeyRows.length; i++) {
      keyNameArray.push(selectKeyRows[i].keyName)
    }
    console.error(keyNameArray);
    if (selectedKeys1.length > 0) {
      this.refs.ttlForm.validateFields((err, p) => {
        if (!err) {
          let params = {
            ...p,
            keyIds: selectedKeys1.join(","),
            keyNames: keyNameArray.join("@")
          };
          var formData = new FormData();
          for (var name in params) {
            formData.append(name, params[name]);
          }
          request(`/dataOperation/saveKeysExpireTime`, {
            method: 'POST',
            body: formData
          }).then((data) => {
            if (data.success) {
              this.setState({
                visibleTTL: false
              });
              this.getKeyList();
              notification.info({
                message: '提示',
                description: "设置成功"
              });
            }
          });
        }
      });
    }
  }

  getRightForm() {
    const state = this.state,
      selectKeyRow = state.selectKeyRow;
    const formProps1 = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 18
      }
    }
    if (state.selectKeyRow) {
      return (
        <div>
                    <Form layout="inline" ref="expireTimeForm">
                        <Form.Item style={{width:'300px'}} {...formProps} label="键名" key='keyName'>
                            <InputGroup size="default">
                                <Input size="small" value={selectKeyRow.keyName} disabled style={{width:'150px','marginTop':'5px','borderRight':0}}/>
                                <Button size="small" type="primary" className="antd-btn-blue3">{selectKeyRow.keyType}</Button>
                            </InputGroup>
                        </Form.Item>
                        <Form.Item style={{width:'290px'}} {...formProps1} label="过期时间" key='keyExpire'>
                            <Input size="small" type="default"  form={{id:'keyExpire',initialValue:selectKeyRow.keyExpire,rules:[{required: true, message: '请输入过期时间'}]}} style={{width:'70px','marginTop':'5px'}}/>
                            <Button type="primary" className='antd-btn-blue2' size="small" style={{'marginLeft':'10px'}} onClick={this.handerClickSaveExpireTime}>修改过期时间</Button>
                        </Form.Item>
                    </Form>
                    <div className={styles.search_right} style={{marginTop:'5px','overflow':'hidden'}}>
                        <div style={{'float':'left'}}>
                            <Button type="primary" size="small" disabled={selectKeyRow.keyType=='String'} style={{marginRight:'10px'}} onClick={this.handerValueAdd}>添加</Button>
                            <Button type="primary" size="small" style={{marginRight:'10px'}} disabled={state.selectedKeys2.length<1} onClick={this.handerDelScore} >批量删除</Button>
                            <Button type="primary" size="small" className='antd-btn-green' onClick={this.handlerSaveRecord}>提交更改</Button>
                        </div>
                        <div style={{'float':'right','overflow':'hidden',marginTop:'2px'}}>
                            <div style={{'float':'right'}}>
                                {
                                    state.searchType ? <Button size="small" type="primary" className='antd-btn-green' style={{marginLeft:'10px'}} onClick={this.handerSearchRight}>查询</Button> : null
                                }
                                <Button type="primary" style={{marginLeft:'10px'}} className='antd-btn-blue1' size="small" onClick={this.handerSearchType}>切换条件</Button>
                                <Button type="primary" className='antd-btn-green' style={{marginLeft:'10px'}} size="small" onClick={this.handerSearchRight}>刷新</Button>
                            </div>
                            {
                                !state.searchType ? <Search
                                        placeholder="输入关键字，按回车搜索"
                                        onSearch={this.handerSearch2}
                                        size="small"
                                        style={{ width: 200,'float':'right'}}
                                    /> :
                                    <div style={{'float':'right'}}>
                                        <span style={{marginLeft:'20px'}}>总计:<label style={{'color':'red'}}>{state.pageInfoRight.total}</label>条</span>Score区间：<InputNumber style={{'width':'70px;'}} size="small" onChange={(e)=>{this.handerScoreChange(e,'min')}}/>&nbsp;到&nbsp;
                                        <InputNumber style={{'width':'70px;'}} size="small"  onChange={(e)=>{this.handerScoreChange(e,'max')}}/>
                                    </div>
                            }
                        </div>
                    </div>
                    {this.getRightEditor()}
                </div>
      )
    } else {
      return (
        <div style={{textAlign:'center'}}>请点击左侧键值进行设置！</div>
      )
    }
  }

  saveAdd() {
    this.refs.addForm.validateFields((err, params) => {
      params.appId = this.state.appId;
      if (!err) {
        request(`/dataOperation/saveKeys`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        }).then((data) => {
          if (data.success) {
            this.setState({
              visibleAdd: false,
              valueList: [],
              selectKeyRow: params
            }, () => {
              this.getKeyList();
              this.getRightEditor();
            });
          }
        });
      }
    });
  }

  render() {
    const { location } = this.props;
    const state = this.state;
    const detailInfo = state.detailInfo;
    const leftCols = [{
      title: "类型",
      dataIndex: "keyType",
      width: 70
    }, {
      title: "键名",
      dataIndex: "keyName",
      render: (text, record, index) => {
        return (
          <div className='text-over-flow' style={{ userSelect: 'none' }}>
            <Tooltip title={record['keyName']} placement="center" >
                {record['keyName']}
            </Tooltip>
         </div>
        );
      }
    }, {
      title: "过期时间(s)",
      dataIndex: "keyExpire",
      width: 100
    }];
    const modalProps1 = {
      visible: this.state.visibleTTL,
      cancelText: '取消',
      okText: '确定',
      title: `设置过期时间`,
      width: 500,
      onOk: () => {
        this.saveTTL();
      },
      onCancel: () => {
        this.setState({
          visibleTTL: false
        })
      }
    }
    const modalProps2 = {
      visible: this.state.visibleAdd,
      cancelText: '取消',
      okText: '确定',
      title: `新增数据`,
      width: 500,
      onOk: () => {
        this.saveAdd()
      },
      onCancel: () => {
        this.setState({
          visibleAdd: false
        })
      }
    }
    const clientHeight = this.getViewHeight();
    const leftTableProps = {
      rowKey: "id",
      columns: leftCols,
      dataSource: state.keyList,
      size: "small",
      bordered: 1,
      scroll: { y: clientHeight - 335 },
      loading: this.state.loading,
      className: styles.dpmTable,
      onRowClick: (record) => {
        this.setState({
          selectKeyRow: record
        }, () => {
          this.getValueListTotal();
          console.error();
          console.error();
          console.error();
          this.getValueList();
        });
      },
      rowSelection: {
        type: "checkbox",
        onChange: (selectedRowKeys, selectedRows) => {
          console.error(selectedRowKeys);
          console.error(selectedRows);
          this.setState({
            selectedKeys1: selectedRowKeys,
            selectedRows: selectedRows
          })
        }
      },
      onChange: (page) => {
        let pageInfo = this.state.pageInfo;
        pageInfo.pageNum = page.current;
        this.setState({
          pageInfo: {
            ...pageInfo
          }
        }, () => {
          this.getKeyList();
        })
      },
      pagination: {
        ...this.state.pageInfo
      }
    }
    return (
      <div className={styles.dpm}>
                <Dropdown overlay={RIGHTMENUS} trigger={['contextMenu']}>
                    <span style={{ userSelect: 'none' }}>Right Click on Me</span>
                 </Dropdown>
                <div className={styles.dmp_c}>
                    <div span={10} className={styles.coll}>
                        <div className={styles.search}>
                            <div>
                                <Search
                                    placeholder="输入关键字，按回车搜索"
                                    onSearch={this.handerSearch1}
                                    style={{ width: 200 }}
                                />
                                <Checkbox onChange={this.handlerOnChange} style={{'marginLeft':'10px'}}><span style={{color:'#2DB7F5'}}>精确搜索</span></Checkbox>
                            </div>
                            <div style={{'marginTop':'10px',marginBottom:'10px'}}>
                                keys：{detailInfo.total} big keys：{detailInfo.big}（估算） 设置超时：{detailInfo.expireTime}
                            </div>
                        </div>
                        <div className={styles.btns}>
                            <Button type="primary" size="small" style={{marginRight:'10px'}} onClick={this.handerAddKey}>添加</Button>
                            <Button type="primary" size="small" style={{marginRight:'10px',verticalAlign:"0"}} disabled={state.selectedKeys1.length<1} onClick={this.handerSetKeys}>批量设置TTL</Button>
                            <Button type="default"  size="small" style={{verticalAlign:"0"}} disabled={state.selectedKeys1.length<1} onClick={this.handerDelKeys} >批量删除</Button>
                        </div>
                       <Table {...leftTableProps}>
                        </Table>
                    </div>
                    <div className={styles.colr}>
                        {this.getRightForm()}
                    </div>
                </div>
                <Modal {...modalProps1}>
                    <div style={{"marginBottom":"10px","paddingLeft":"18px"}}>
                        将为&nbsp;<span style={{'color':'red'}}>{state.selectedKeys1.length}</span>&nbsp; 个key设置过期时间
                    </div>
                    <Form layout="horizontal" ref="ttlForm" style={{width:'475px'}} >
                        <Form.Item {...formProps} label="过期时间" key='keyExpire'>
                            <InputNumber defaultValue="0" style={{width:'170px'}} form={{id:'keyExpire',initialValue:"0",rules:[{required: true, message: '请填写过期时间'}]}}/>
                        </Form.Item>
                    </Form>
                </Modal>
                <Modal {...modalProps2}>
                    <Form layout="horizontal" ref="addForm" style={{width:'475px','paddingRight':'20px'}}>
                        <Form.Item {...formProps} label="键名" key='keyName'>
                            <Input form={{id:'keyName',initialValue:"",rules:[{required: true, message: '请填写键名'}]}}/>
                        </Form.Item>
                        <Form.Item {...formProps} label="类型" key='keyType'>
                            <Select form={{id:'keyType',initialValue:"String",rules:[{required: true, message: '请选择类型'}]}}>
                                {
                                    state.keyTypes.map((op, i) => {
                                            return (
                                              <Option value={op.id} key={op.id}>{op.name}</Option>
                                            )
                                          })
                                }
                            </Select>
                        </Form.Item>
                    </Form>
                </Modal>
                <div className="dpm-right">
                </div>
            </div>
    );
  }
};