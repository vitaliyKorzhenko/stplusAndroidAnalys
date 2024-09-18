import axios from 'axios';

axios.defaults.headers.post['Content-Type'] ='application/x-www-form-urlencoded';

const baseURL = 'https://www.statplus.org';
// TODO: baseURL from config
export default axios.create({
  baseURL: baseURL,
  responseType: "json",
  withCredentials: false,
  

});
