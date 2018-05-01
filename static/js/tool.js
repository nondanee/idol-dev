function fromNow(date){
	let now = new Date()
	let timeDelta = parseInt((now - date)/1000)
	let timeInfo
	if(timeDelta < 300)
		timeInfo = "刚刚"
	else if (timeDelta < 3600)
		timeInfo = parseInt(timeDelta/60) + " 分钟前"
	else
		timeInfo = parseInt(timeDelta/3600) + " 小时前"
	return timeInfo
}

function timeFormat(date){
	let month = (date.getMonth() + 1).toString()
	let day = date.getDate().toString()
	let hour = date.getHours().toString()
	let minute = date.getMinutes()
	minute = (minute < 10) ? "0"+minute.toString() : minute.toString()
	let timeInfo = month + "/" + day + " " + hour + ":" + minute
	return timeInfo
}

function timeFriendly(date){
	let post = new Date(date)
	let today = new Date()
	today.setHours(0)
	today.setMinutes(0)
	today.setSeconds(0)
	today.setMilliseconds(0)
	if (post > today)
		return fromNow(post)
	else
		return timeFormat(post)
}

function toTop(element){
	let delay = null
	let previous = element.scrollTop
	function scrollTop(){
		if(element.scrollTop == 0)
			clearTimeout(delay)
		else if(previous != element.scrollTop)//interrupt
			clearTimeout(delay)
		else{
			previous -= 60
			element.scrollTop = previous
			delay = setTimeout(function(){
				scrollTop()
			},10)
		}
	}
	scrollTop()
}