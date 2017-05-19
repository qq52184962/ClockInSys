import * as React from 'react';
import { connect } from 'react-redux';
import { actionCreators, reducer } from '../store/homeStore';
import '../css/index.css';
import moment from 'moment';
import { Link } from 'react-router';

const style = {
    tr1: { textAlign: 'left', marginLeft: '2em' },
    tr2: { textAlign: 'left', paddingLeft: '2em'}
}

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.intervalId;
        this._intervalId;
        this.init = this.init.bind(this);
    }

    init() {
        this.props.getInitState();
        var map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: 24.997233,
                lng: 121.538548
            },
            zoom: 13
        });
        var infoWindow = new google.maps.InfoWindow({
            map: map
        });
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                infoWindow.setPosition(pos);
                infoWindow.setContent(pos.lat.toString().substring(0, 9) + ", " + pos.lng.toString().substring(0, 9));
                map.setCenter(pos);
                window.pos = pos;
            },
            function() {
                handleLocationError(true, infoWindow, map.getCenter());
            });
        } else {
            handleLocationError(false, infoWindow, map.getCenter());
        }
        
        window.handleLocationError = (browserHasGeolocation, infoWindow, pos) => {
            infoWindow.setPosition(pos);
            infoWindow.setContent(browserHasGeolocation ? '定位錯誤' :
                '不支援定位的瀏覽器');
        }
    }

    componentDidMount() {
        if (typeof window === 'object') {
            if (window.onload)
                window.onload();
            window.onload = () => {
                if (typeof google === 'object')
                    this.init();
            }
            this._intervalId = setInterval(() => {
                if (this.props.data.currentTime) {
                    var time = new moment(this.props.data.currentTime, "HH:mm:ss tt");
                    this.intervalId = setInterval(() => {
                        this.props.timeTicking(time);
                    }, 1000);
                    clearInterval(this._intervalId);
                }
            }, 200);
            setTimeout(() => {clearInterval(this._intervalId)}, 10000);
        }
    }
    
    componentWillUnmount() {
        clearInterval(this.intervalId);
        clearInterval(this._intervalId);
    }
    
    render() {
        var data = this.props.data;
        var disabledIn = data.shouldCheckInDisable ? 'disabled' : '';
        var disabledOut = data.shouldCheckOutDisable ? 'disabled' : '';
        var checkIn = data.checkIn ? new moment(data.checkIn, 'HH:mm:ss tt').format("HH:mm:ss") : null;
        var checkOut = data.checkOut ? new moment(data.checkOut, 'HH:mm:ss tt').format("HH:mm:ss") : null;
        return (
            <div>
                <div className="content_wrapper">
                    <div id="dispDate" className="checkin_date">{ data.currentDate }</div>
                    <div id="dispTime" className="checkin_time">{ data.currentTime }</div>
                    <table
                        style={{
                        width: '50%',
                        margin: '0 auto',
                        marginBottom: '3%'}}>
                        <tbody>
                            <tr>
                                <td style={style.tr1} className="record_time">上班:</td>
                                <td style={style.tr2} className="record_time">{ checkIn }</td>
                            </tr>
                            <tr>
                                <td style={style.tr1} className="record_time">下班:</td>
                                <td style={style.tr2} className="record_time">{ checkOut }</td>
                            </tr>
                            <tr>
                                <td style={style.tr1} className="record_time">本日狀態:</td>
                                <td style={style.tr2} className="record_time">
                                    { data.offStatus ? data.offStatus : null }
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className='map_wrapper'>
                    <div id='map' style={{height: '100%', width: '100%'}}>請刷新瀏覽器</div>
                </div>
                <div className="content_wrapper">
                    <div className="mps_row">
                        <button id="checkIn" className={`mps_btn btn_blue ${disabledIn}`} 
                                disabled={data.shouldCheckInDisable}
                                onClick={() => {this.props.proceedCheck('checkIn');}}>
                                簽到
                        </button>
                    </div>
                    <div className="mps_row">
                        <button id="checkOut" className={`mps_btn btn_dark_grey ${disabledOut}`}
                                disabled={data.shouldCheckOutDisable}
                                onClick={() => {this.props.proceedCheck('checkOut');}}>
                                簽退
                        </button>
                    </div>
                    <div className="mps_row">
                        <button id="applyDayOff" className="mps_btn btn_red">
                            <Link to='/dayOff' style={{color: '#fff', textDecoration: 'none', display: 'block'}}>
                                請假
                            </Link>
                        </button>
                    </div>
                </div>
                <script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCgR4Fmw4SAbpzAwA6mivcy6viFm38OztE"></script>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        data: state.home.data
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        getInitState: () => {
            dispatch(actionCreators.getInitState());
        },
        timeTicking: (time) => {
            dispatch(actionCreators.timeTicking(time))
        },
        proceedCheck: (type) => {
            var position = null;
            if(typeof window === 'object')
                position = `${window.pos.lat}, ${window.pos.lng}`
            dispatch(actionCreators.proceedCheck(position, type));
        }
    };
}

const wrapper = connect(mapStateToProps, mapDispatchToProps);

export default wrapper(Home);
