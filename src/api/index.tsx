import axios from 'axios';

axios.defaults.headers.post['Content-Type'] ='application/x-www-form-urlencoded';

//const baseURLOld = 'https://www.statplus.org';

const baseURL = 'http://5.9.99.212:4030';
// TODO: baseURL from config
export default axios.create({
  baseURL: baseURL,
  responseType: "json",
  withCredentials: false,
  

});
