function timeConverter(t) {
	const a = new Date(t * 1000);

	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	const year = a.getFullYear();
	const month = months[a.getMonth()];
	const date = a.getDate();

	const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const day = days[a.getDay()];

	const hour = a.getHours() < 10 ? '0' + a.getHours() : a.getHours();
	const min = a.getMinutes() < 10 ? '0' + a.getMinutes() : a.getMinutes();

	return day + ', ' + date + ' ' + month + ' ' + year + ' - ' + hour + ':' + min;
}

export default timeConverter;
