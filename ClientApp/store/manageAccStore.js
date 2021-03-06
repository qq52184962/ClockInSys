import { Action, Reducer } from 'redux';
import { fetch, addTask } from 'domain-task';
import { browserHistory } from 'react-router';
import moment from 'moment';

const initState = {
    isEmailValid: true,
    isLoading: false,
    choosedOpt: null,
    showContent: false,
    showDialog: false,
    showErrorMsg: false,
    UserName: '',
    UserEmail: '',
    PhoneNumber: '',
    DateOfEmployment: new moment().format('YYYY-MM-DD'),
    DateOfQuit: null,
    JobTitle: '',
    AnnualLeaves: '0',
    SickLeaves: '30',
    FamilyCareLeaves: '7',
    Supervisor: [],
    Deputy: [],
    Authority: 'default'
}

export const getNumOfLeave = (date) => {
    var today = new moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    var diff = today.diff(date, 'months');
    switch (true) {
        case diff >= 6 && diff < 12: // 0.5 - 1, 3days
            return 3;
        case diff >= 12 && diff < 24: // 1 - 2, 7 days
            return 7;
        case diff >= 24 && diff < 36: // 2 - 3, 10 days
            return 10;
        case diff >= 36 && diff < 60: // 3 - 5, 14 days
            return 14;
        case diff >= 60 && diff < 120: // 5 - 10, 15 days
            return 15;
        case diff >= 120: // at 10, 16 days
            var result = 15 + parseInt((diff - 108) / 12);
            if (result > 30)
                return 30;
            return result;
        default:
            return 0;
    }
}
export const actionCreators = {
    handleChange: (value) => (dispatch, getState) => {
        dispatch({ type: 'OPTION_CHANGE', payload: { choosedOpt: value, showErrorMsg: false } });
    },
    onNewAccountClick: () => (dispatch, getState) => {
        dispatch({ type: 'ON_NEW_BTN_CLICK', payload: Object.assign({}, initState, { showContent: true }) });
    },
    onUpdateAccountClick: (_id) => (dispatch, getState) => {
        let fetchTask = fetch('api/account/getUserInfo', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({
                Id: _id
            })
        }).then(response => response.json()).then(data => {
            if (!data.status)
                dispatch({ type: 'REQUEST_USER_INFO_FAILED' });
            else {
                var _data = {
                    isLoading: false,
                    UserName: data.payload.a,
                    UserEmail: data.payload.b,
                    PhoneNumber: data.payload.c ? data.payload.c : '',
                    DateOfEmployment: new moment(data.payload.d, 'YYYY-MM-DD').format('YYYY-MM-DD'),
                    DateOfQuit: data.payload.l ? new moment(data.payload.l, 'YYYY-MM-DD').format('YYYY-MM-DD') : null,
                    JobTitle: data.payload.e ? data.payload.e : '',
                    AnnualLeaves: data.payload.f,
                    SickLeaves: data.payload.g,
                    FamilyCareLeaves: data.payload.h,
                    Supervisor: data.payload.j,
                    Deputy: data.payload.i,
                    Authority: data.payload.k,
                };
                dispatch({ type: 'REQUEST_USER_INFO', payload: _data });
            }
        }).catch(error => {
            dispatch({ type: 'REQUEST_USER_INFO_FAILED' });
        });
        addTask(fetchTask);
        dispatch({ type: 'ON_UPDATE_BTN_CLICK', payload: { showContent: true, isLoading: true } });
    },
    onCancelUpdate: () => (dispatch, getState) => {
        dispatch({ type: 'ON_GOBACK_BTN_CLICK', payload: { showContent: false } });
    },
    onDeleteAccount: (_id) => (dispatch, getState) => {
        let fetchTask = fetch('api/account/deleteUser', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({
                Id: _id
            })
        }).then(response => response.json()).then(data => {
            if (data.status) {
                dispatch({ type: 'REQUEST_DELETE_ACCOUNT', payload: initState });
                browserHistory.push('/manageaccount/confirm/deleted');
            } else {
                dispatch({ type: 'REQUEST_DELETE_ACCOUNT_FAILED', payload: initState });
                browserHistory.push('/manageaccount/confirm/deletedError');
            }
        }).catch(error => {
            dispatch({ type: 'REQUEST_DELETE_ACCOUNT_FAILED' });
        });
        addTask(fetchTask);
    },
    onUpdateClick: (_id) => (dispatch, getState) => {
        var URL = 'api/account/updateUser',
            CALLBACK_URL = '/manageaccount/confirm/updated';
        if (!_id) {
            URL = 'api/account/createUser';
            CALLBACK_URL = '/manageaccount/confirm/created';
        }
        var store = getState().manageAccount;
        let fetchTask = fetch(URL, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({
                Id: _id ? _id : null,
                UserName: store.UserName,
                UserEmail: store.UserEmail,
                PhoneNumber: store.PhoneNumber,
                DateOfEmployment: store.DateOfEmployment,
                DateOfQuit: store.DateOfQuit,
                JobTitle: store.JobTitle,
                AnnualLeaves: store.AnnualLeaves,
                SickLeaves: store.SickLeaves,
                FamilyCareLeaves: store.FamilyCareLeaves,
                Supervisor: store.Supervisor,
                Deputy: store.Deputy,
                Authority: store.Authority
            })
        }).then(response => response.json()).then(data => {
            if (data.status) {
                dispatch({ type: 'REQUEST_UPDATE_ACCOUNT', payload: initState });
                browserHistory.push(CALLBACK_URL);
            } else {
                dispatch({ type: 'REQUEST_UPDATE_ACCOUNT_FAILED', payload: initState });
                browserHistory.push(`${CALLBACK_URL}Error`);
            }
        }).catch(error => {
            dispatch({ type: 'REQUEST_UPDATE_ACCOUNT_FAILED' });
        });
        addTask(fetchTask);
    },
    onDeleteClick: () => (dispatch, getState) => {
        dispatch({ type: 'ON_DELETE_BTN_CLICK', payload: { showDialog: true } })
    },
    onDialogCancel: () => (dispatch, getState) => {
        dispatch({ type: 'ON_DELETE_BTN_CANCEL', payload: { showDialog: false } });
    },
    showErrorMsg: () => (dispatch, getState) => {
        dispatch({ type: 'SHOW_ERROR_MSG', payload: { showErrorMsg: true } });
    },
    onTextChange: (name, value) => (dispatch, getState) => {
        var obj = {};
        obj[name] = value;
        dispatch({ type: 'ON_TEXT_CHANGE', payload: obj });
    },
    onDateChange: (date) => (dispatch, getState) => {
        dispatch({ type: 'ON_DATE_CHANGE', payload: { DateOfEmployment: date, AnnualLeaves: getNumOfLeave(date) } });
    },
    onQuitDateChange: (date) => (dispatch, getState) => {
        dispatch({ type: 'ON_QUIT_DATE_CHANGE', payload: { DateOfQuit: date, Authority: 'inactive' } });
    },
    onAuthChange: (value) => (dispatch, getState) => {
        dispatch({ type: 'ON_AUTH_CHANGE', payload: { Authority: value } });
    },
    onDeputyChange: (value) => (dispatch, getState) => {
        dispatch({ type: 'ON_DEPUTY_CHANGE', payload: { Deputy: value } });
    },
    onSupervisorChange: (value) => (dispatch, getState) => {
        dispatch({ type: 'ON_SUPERVISOR_CHANGE', payload: { Supervisor: value } });
    },
    onValidEmail: (id) => (dispatch, getState) => {
        var val = getState().manageAccount.UserEmail;
        let fetchTask = fetch('api/account/isEmailValid', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({
                id: id,
                param: val
            })
        }).then(response => response.json()).then(data => {
            if (data.status) {
                dispatch({ type: 'EMAIL_IS_VALID', payload: { isEmailValid: true } });
            } else {
                dispatch({ type: 'EMAIL_IS_INVALID', payload: { isEmailValid: false } });
            }
        }).catch(error => {
            dispatch({ type: 'EMAIL_IS_INVALID', payload: { isEmailValid: false } });
        });
        addTask(fetchTask);
    }
};



export const reducer = (state = initState, action) => {
    var _data = Object.assign({}, state, action.payload);
    switch (action.type) {
        case 'OPTION_CHANGE':
        case 'ON_NEW_BTN_CLICK':
        case 'ON_GOBACK_BTN_CLICK':
        case 'ON_UPDATE_BTN_CLICK':
        case 'ON_DELETE_BTN_CLICK':
        case 'ON_DELETE_BTN_CANCEL':
        case 'SHOW_ERROR_MSG':
        case 'REQUEST_USER_INFO':
        case 'REQUEST_UPDATE_ACCOUNT':
        case 'REQUEST_DELETE_ACCOUNT':
        case 'ON_TEXT_CHANGE':
        case 'ON_DATE_CHANGE':
        case 'ON_QUIT_DATE_CHANGE':
        case 'ON_AUTH_CHANGE':
        case 'ON_DEPUTY_CHANGE':
        case 'ON_SUPERVISOR_CHANGE':
        case 'EMAIL_IS_VALID':
        case 'EMAIL_IS_INVALID':
            return _data;
        case 'REQUEST_USER_INFO_FAILED':
        case 'REQUEST_DELETE_ACCOUNT_FAILED':
        case 'REQUEST_UPDATE_ACCOUNT_FAILED':
            return _data;
        default:
            return state;
    }
};