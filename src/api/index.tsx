import axios from 'axios';

axios.defaults.headers.post['Content-Type'] ='application/x-www-form-urlencoded';

// TODO: baseURL from config
export default axios.create({
  baseURL: '/',
  responseType: "json",
  withCredentials: false,
  

});
