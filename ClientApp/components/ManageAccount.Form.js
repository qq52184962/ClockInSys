import React, { Component } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.min.css';
import { actionCreators, reducer } from '../store/manageAccStore';
import { DateInput } from './DayOff';
import moment from 'moment';
import '../css/manageAccount.css';
import { getOptions } from './ManageAccount';
import { style } from './Report.Dialog';

const _style = {
    btn: {width: '40%', margin: '1% 5%', color: '#fff'}
}
class ManageForm extends Component {
    constructor(props){
        super(props);
        this.authOptions = [
            {label: '老闆', value: 'boss'},
            {label: '系統管理員', value: 'admin'},
            {label: '主管', value: 'manager'}, 
            {label: '一般帳戶', value: 'default'},
            {label: '已關閉帳戶', value: 'inactive'},
        ];
        this.state = { isNameValid: true, isAuthValid: true };
    }

    render() { 
        var idDisabled = this.props.data.isEmailValid && 
                         this.props.data.UserName && 
                         this.props.data.UserEmail &&
                         this.props.data.Authority;
        if(this.props.data.isLoading) 
            return (<div style={{ fontSize: '24px' }}>載入中...</div>); else
        return (
            <div className='selectManage'>
                <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                    <span style={{ color: 'red' }}>*</span>必填
                </div>
                <div className='form_div'>
                    <label>姓名<span style={{ color: 'red' }}>*</span>:</label>
                    <input type="text" 
                           name='UserName'
                           className='form_input'
                           onBlur={ (e) => { 
                               if(this.props.data.UserName)
                                   this.setState({ isNameValid: true });
                               else
                                   this.setState({ isNameValid: false });
                           } }
                           style={ this.state.isNameValid ? null : { borderColor: 'red' } }
                           value={ this.props.data.UserName }
                           onChange={ this.props.onTextChange } />
                </div>
                <div className='form_div'>
                    <label>電話:</label>
                    <input type="text" 
                           name='PhoneNumber'
                           className='form_input'
                           value={ this.props.data.PhoneNumber }
                           onChange={ this.props.onTextChange }/>
                </div>
                <div className='form_div'>
                    <label>入職日:</label>
                    <DatePicker dropdownMode="select"
                        selected={ new moment(this.props.data.DateOfEmployment, 'YYYY-MM-DD') }
                        onChange={ this.props.onDateChange }
                        style={{textAlign: "center"}}
                        showYearDropdown showMonthDropdown 
                        customInput={<DateInput/>} />
                </div>
                <div className='form_div'>
                    <label>離職日:</label>
                    <DatePicker dropdownMode="select"
                        isClearable={ true }
                        selected={ this.props.data.DateOfQuit ? new moment(this.props.data.DateOfQuit, 'YYYY-MM-DD') : null }
                        onChange={ this.props.onQuitDateChange }
                        style={{textAlign: "center"}}
                        showYearDropdown showMonthDropdown 
                        customInput={<DateInput/>} />
                </div>
                <div className='form_div'>
                    <label>職稱:</label>
                    <input type="text" 
                           name='JobTitle'
                           className='form_input'
                           value={ this.props.data.JobTitle }
                           onChange={ this.props.onTextChange }/>
                </div>
                <div className='form_div'>
                    <label>信箱<span style={{ color: 'red' }}>*</span>:</label>
                    <input type="email"
                           name='UserEmail'
                           className='form_input'
                           style={ this.props.data.isEmailValid ? null : { borderColor: 'red' } }
                           onBlur={ () => this.props.onValidEmail(this.props.data) }
                           value={ this.props.data.UserEmail }
                           onChange={ this.props.onTextChange }/>
                </div>
                <div  className='form_div'>
                    <label>特休天數:</label>
                    <input type="number" min='0'
                           name='AnnualLeaves'
                           className='form_input'
                           value={ this.props.data.AnnualLeaves }
                           onChange={ this.props.onTextChange }/>
                </div>
                <div className='form_div'>
                    <label >病假天數:</label>
                    <input type="number" min='0' 
                           name='SickLeaves'
                           className='form_input'
                           value={ this.props.data.SickLeaves }
                           onChange={ this.props.onTextChange }/>
                </div>
                <div className='form_div'>
                    <label>家庭照顧假天數:</label>
                    <input type="number" min='0'
                           name='FamilyCareLeaves'
                           className='form_input'
                           value={ this.props.data.FamilyCareLeaves }
                           onChange={ this.props.onTextChange }/>
                </div>
                <div className='form_div'>
                    <label>主管:</label>
                    <Select.Async className='form_input' 
                                  value={ this.props.data.Supervisor }
                                  onChange={ this.props.onSupervisorChange }
                                  multi={true} 
                                  clearable={false}
                                  ignoreCase={true}
                                  loadOptions={ getOptions }></Select.Async>
                </div>
                <div className='form_div'>
                    <label>代理人:</label>
                    <Select.Async className='form_input' 
                                  value={ this.props.data.Deputy }
                                  onChange={ this.props.onDeputyChange }
                                  multi={true} 
                                  clearable={false}
                                  ignoreCase={true}
                                  loadOptions={ getOptions }></Select.Async>
                </div>
                <div className='form_div'>
                    <label>權限設定<span style={{ color: 'red' }}>*</span>:</label>
                    <Select className='form_input' 
                            searchable={false} 
                            clearable={false}
                            value={ this.props.data.Authority }
                            onChange={ this.props.onAuthChange }
                            options={this.authOptions}
                            style={ this.state.isAuthValid ? null : { borderColor: 'red' } }
                            onBlur={ ()=> {
                                if(this.props.data.Authority)
                                    this.setState({ isAuthValid: true });
                                else
                                    this.setState({ isAuthValid: false });
                            } }></Select>
                </div>
                <div>
                    <button className='btn_date btn_info'
                            style = {
                                idDisabled ?
                                _style.btn :
                                { ..._style.btn, ...style.disabled }
                            }
                            disabled={ !idDisabled }
                            onClick={ () => { this.props.onUpdateClick(this.props.data) }}>
                        確認
                    </button>
                    <button className='btn_date btn_danger' 
                            style={ _style.btn }
                            onClick={ () => { this.props.onCancelUpdate() } }>
                        返回
                    </button>
                </div>
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        data: state.manageAccount
    };
}
const mapDispatchToProps = (dispatch) => {
    return {
        onAuthChange: (e) => {
            dispatch(actionCreators.onAuthChange(e.value));
        },
        onDeputyChange: (e) => {
            dispatch(actionCreators.onDeputyChange(e));
        },
        onSupervisorChange: (e) => {
            dispatch(actionCreators.onSupervisorChange(e));
        },
        onTextChange: (e) => {
            dispatch(actionCreators.onTextChange(e.target.name, e.target.value));
        },
        onDateChange: (e) => {
            dispatch(actionCreators.onDateChange(e.format('YYYY-MM-DD')));
        },
        onUpdateClick: (props) => {
            if (props.UserName.trim() && props.UserEmail.trim() && props.Authority) {
                if(props.choosedOpt)
                    dispatch(actionCreators.onUpdateClick(props.choosedOpt.value));
                else
                    dispatch(actionCreators.onUpdateClick());
            } else
                console.log('error')
        },
        onCancelUpdate: () => {
            dispatch(actionCreators.onCancelUpdate());
        },
        onValidEmail: (props) => {
            if (props.choosedOpt)
                    dispatch(actionCreators.onValidEmail(props.choosedOpt.value));
                else
                    dispatch(actionCreators.onValidEmail());
        },
        onQuitDateChange: (e) => {
            var date = null;
            if(e)
                date = e.format('YYYY-MM-DD');
            dispatch(actionCreators.onQuitDateChange(date));
        }
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(ManageForm);
