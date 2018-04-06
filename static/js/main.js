function Feed(baseUrl,feedDom,scrollDom){
	let loading = false
	let end = false
	let page = 1
	function loadMore(){
		if(!end){
			if(!loading){
				loading = true
				ajaxRequest("GET",baseUrl+"?page="+page,function (responseText){
					let feed = JSON.parse(responseText)
					if(feed.length == 0){
						end = true
					}
					buildFeed(feedDom,feed)
					page = page + 1
					loading = false
				})
			}
		}
	}
	scrollDom.addEventListener("scroll", function()	{
		if (this.scrollHeight - 240 < this.scrollTop + this.offsetHeight) {
			loadMore()
		}
	})
	loadMore()
}

function Overview(mid,overviewDom,activityDom){
	let topbarDom
	let front = activityDom.childNodes[1]
	
	ajaxRequest("GET","/api/overview?mid="+mid,function(responseText){
		let overview = JSON.parse(responseText)
		buildOverview(overviewDom,overview)
		topbarDom = overviewDom.getElementsByClassName("topbar")[0]
	})
	
	let beforeScroll = front.scrollTop
	front.addEventListener("scroll", function()	{
		let afterScroll = this.scrollTop
		let delta = afterScroll - beforeScroll
		
		beforeScroll = afterScroll
		if(afterScroll == 0){
			topbarDom.className = "topbar"
		}
		else if( delta < -8 ){
			topbarDom.className = "topbar fixed"
		}
		else if( delta > 8 ){
			topbarDom.className = "topbar"
		}
	})
}



function buildFeed(feedDom,feed){
	let fragment = document.createDocumentFragment()
	for(let i=0;i<feed.length;i++){
		let blog = feed[i]
		let cardDom = document.createElement('div')
		cardDom.className = "card"
		let fromDom = document.createElement('div')
		fromDom.className = "from"
		let infoDom = document.createElement('div')
		infoDom.className = "info"
		let avatarDom = document.createElement('div')
		avatarDom.className = "avatar"
		let authorDom = document.createElement('div')
		authorDom.className = "author"
		let groupDom = document.createElement('div')
		groupDom.className = "group"
		let fillDom = document.createElement('div')
		fillDom.className = "fill"
		let timeDom = document.createElement('div')
		timeDom.className = "time"
		let contentDom = document.createElement('div')
		contentDom.className = "content"
		let textDom = document.createElement('div')
		textDom.className = "text"
		let titleDom = document.createElement('div')
		titleDom.className = "title"
		let snippetDom = document.createElement('div')
		snippetDom.className = "snippet"
		let imageDom = document.createElement('div')
		imageDom.className = "image"
		let favorDom = document.createElement('div')
		favorDom.className = "favor"
		let countDom = document.createElement('div')
		countDom.className = "count"
		let favorButton = new FavorButton(blog.fid,blog.favored,countDom)
		
		avatarDom.style.backgroundImage = 'url(https://dev.aidoru.tk'+blog.author.avatar+')'
		authorDom.innerHTML = blog.author.name
		groupDom.innerHTML = blog.author.affiliation
		timeDom.innerHTML = timeFriendly(blog.post)
		titleDom.innerHTML = blog.title
		snippetDom.innerHTML = blog.snippet
		imageDom.style.backgroundImage = 'url(https://dev.aidoru.tk'+blog.image+')'
		countDom.innerHTML = (blog.favors == 0) ? '' : blog.favors

		fromDom.onclick = function (){
			newActivity('member',{'mid':blog.author.mid})
		}

		contentDom.onclick = function (){
			newActivity('diary',{'fid':blog.fid})
		}

		fromDom.appendChild(avatarDom)
		fromDom.appendChild(authorDom)
		fromDom.appendChild(groupDom)
		fromDom.appendChild(fillDom)
		fromDom.appendChild(timeDom)
		cardDom.appendChild(fromDom)
		textDom.appendChild(titleDom)
		textDom.appendChild(snippetDom)
		contentDom.appendChild(textDom)
		if (blog.image!="")
			contentDom.appendChild(imageDom)
		cardDom.appendChild(contentDom)
		favorDom.appendChild(favorButton)
		favorDom.appendChild(countDom)
		cardDom.appendChild(favorDom)
		fragment.appendChild(cardDom)
	}
	feedDom.appendChild(fragment)
}


function buildOverview(overviewDom,overview){
	let topbarDom = document.createElement('div')
	topbarDom.className = "topbar"
	let backButton = new BackButton()
	let fillDom = document.createElement('div')
	fillDom.className = "fill"	
	let avatarDom = document.createElement('div')
	avatarDom.className = "avatar"
	avatarDom.style.backgroundImage = 'url(https://dev.aidoru.tk'+overview.avatar+')'
	let nameDom = document.createElement('div')
	nameDom.className = "name"
	nameDom.innerHTML = overview.name
	let introductionDom = document.createElement('div')
	introductionDom.className = "introduction"
	introductionDom.innerHTML = overview.affiliation
	let informationDom = document.createElement('div')
	informationDom.className = "information"
	let followsDom = document.createElement('span')
	followsDom.className = "follows"
	followsDom.innerHTML = overview.follows
	let subscribesDom = document.createElement('span')
	subscribesDom.className = "subscribes"
	subscribesDom.innerHTML = overview.subscribes
	let followButton = new FollowButton(overview.mid,overview.followed,followsDom)
	let subscribeButton = new SubscribeButton(overview.mid,overview.subscribed,subscribesDom)
	topbarDom.appendChild(backButton)
	topbarDom.appendChild(fillDom)
	topbarDom.appendChild(subscribeButton)
	informationDom.appendChild(followsDom)
	informationDom.appendChild(subscribesDom)
	overviewDom.appendChild(topbarDom)
	overviewDom.appendChild(avatarDom)
	overviewDom.appendChild(nameDom)
	overviewDom.appendChild(introductionDom)
	overviewDom.appendChild(informationDom)
	overviewDom.appendChild(followButton)
}



// <div class="card">
// 	<div class="from">
// 		<div class="avatar" style="background-image: url(https://aidoru.tk/avatar/imaizumi-yui.jpg)"></div>
// 		<div class="author">今泉 佑唯</div>
// 		<div class="group">欅坂46</div>
// 		<div class="fill"></div>
// 		<div class="time">12 月 22 日</div>
// 	</div>
// 	<div class="content">
// 		<div class="text">
// 			<div class="title">変身〜✨</div>
// 			<div class="snippet"> こんにちは☀︎ 12月21日発売の『OVER TURE No.013』さんと『ViVi』さんに掲載していただいております! 撮影ではいつもと違う自分に変身することができるので新しい発見ができてとっても嬉しいし、とっても楽しいです♪</div>
// 		</div>
// 		<div class="image" style="background-image: url(http://cdn.keyakizaka46.com/images/14/8f6/509ed0fbdaaa0b4630c77536f6c82.jpg)"></div>
// 	</div>
// 	<div class="favor">
// 		<button class="heart"></button>
//		<div class="count">3</div>
// 	</div>
// </div>


function ajaxRequest(method,url,callBack){
	let xhr=new XMLHttpRequest()
	xhr.onreadystatechange=function(){
		if(xhr.readyState==4){
			if(xhr.status==200||xhr.status==202||xhr.status==204){
				callBack(xhr.responseText)
			}
		}
	}
	xhr.open(method,url,true)
	xhr.send()
}

function FavorButton(fid,favored,counter){
	let loading = 0
	let button = document.createElement('button')
	if(favored){
		button.className = "heart"
	}
	else{
		button.className = "heart off"
	}
	button.onclick = function (){
		if(!loading){
			loading = 1
			if(!favored){
				ajaxRequest("POST","/api/like/create?fid="+fid,function(){
					favored = !favored
					button.className = "heart"
					counterChange(counter,+1,false)
					loading = 0
				})
			}
			else{
				ajaxRequest("POST","/api/like/destroy?fid="+fid,function(){
					favored = !favored
					button.className = "heart off"
					counterChange(counter,-1,false)
					loading = 0
				})
			}
		}
		
	}
	return button
}

function FollowButton(mid,followed,counter){
	let loading = 0
	let button = document.createElement('button')
	if(followed){
		button.className = "follow"
	}
	else{
		button.className = "follow off"
	}
	button.onclick = function (){
		if(!loading){
			loading = 1
			if(!followed){
				ajaxRequest("POST","/api/follow/add?mid="+mid,function(){
					followed = !followed
					button.className = "follow"
					counterChange(counter,+1,true)
					loading = 0
				})
			}
			else{
				ajaxRequest("POST","/api/follow/remove?mid="+mid,function(){
					followed = !followed
					button.className = "follow off"
					counterChange(counter,-1,true)
					loading = 0
				})
			}
		}
		
	}
	return button
}

function BackButton(){
	let button = document.createElement('button')
	button.className = "back"
	button.onclick = function (event){
		event.stopPropagation()
		history.back(-1) | window.close()
	}
	return button
}

function counterChange(dom,change,reserve_zero){ 
	let before = (dom.innerHTML == "") ? 0 : parseInt(dom.innerHTML)
	let after = before + change
	if(!reserve_zero&&after==0){
		dom.innerHTML = ""
	}
	else{
		dom.innerHTML = after
	}
}

function SubscribeButton(mid,subscribed,counter){
	let loading = 0
	let button = document.createElement('button')
	if(subscribed){
		button.className = "subscribe"
	}
	else{
		button.className = "subscribe off"
	}
	button.onclick = function (){
		if(!loading){
			loading = 1
			if(!subscribed){
				ajaxRequest("POST","/api/subscription/confirm?mid="+mid,function(){
					subscribed = !subscribed
					button.className = "subscribe"
					counterChange(counter,+1,true)
					loading = 0
				})
			}
			else{
				ajaxRequest("POST","/api/subscription/cancel?mid="+mid,function(){
					subscribed = !subscribed
					button.className = "subscribe off"
					counterChange(counter,-1,true)
					loading = 0
				})
			}
		}
	}
	return button
}



// <div class="activity member">
// 	<div class="topbar">
// 		<button class="back"></button>
// 		<div class="fill"></div>
// 		<button class="subscribe"></button>
// 	</div>
// 	<div class="overview">
// 		<div class="avatar"></div>
// 		<div class="name">数字尾巴</div>
// 		<div class="introduction">「尾巴」们分享的美好数字生活</div>
// 		<div class="information">
// 			<span class="follows">304666</span>
// 			<span class="subscribes">42万</span>
// 		</div>
// 		<button class="follow"></button>
// 	</div>
// 	<div class="feed"></div>
// </div>


// <div class="activity">
// 	<div class="topbar">
// 		<button class="grid"></button>
// 		<button class="list"></button>
// 		<div class="fill"></div>
// 		<button class="more"></button>
// 	</div>
// 	<div class="container">
// 		<div class="side-by-side">
// 			<div class="view feed"></div>
// 		</div>
// 	</div>
// </div>


function buildMainTopbar(topbarDom){
	let gridButton = document.createElement('button')
	gridButton.className = "grid"
	let listButton = document.createElement('button')
	listButton.className = "list"
	let fillDom = document.createElement('div')
	fillDom.className = "fill"
	let moreButton = document.createElement('button')
	moreButton.className = "more"
	topbarDom.appendChild(gridButton)
	topbarDom.appendChild(listButton)
	topbarDom.appendChild(fillDom)
	topbarDom.appendChild(moreButton)
}


function activity(type){
	let activityDom = document.createElement('div')
	activityDom.classList.add("activity",type)
	let back = document.createElement("div")
	back.className = "back"
	let front = document.createElement("div")
	front.className = "front"
	activityDom.appendChild(back)
	activityDom.appendChild(front)
	return activityDom
}

function newActivity(type,params){
	if (type=="main"){
		let activityDom = document.createElement('div')
		activityDom.className = "activity main"
		let topbarDom = document.createElement('div')
		topbarDom.className = "topbar"
		buildMainTopbar(topbarDom)
		let containerDom = document.createElement('div')
		containerDom.className = "container"
		let sideBySideDom = document.createElement('div')
		sideBySideDom.className = "side-by-side"
		let feedDom = document.createElement('div')
		feedDom.className = "feed"
		sideBySideDom.appendChild(feedDom)
		containerDom.appendChild(sideBySideDom)
		activityDom.appendChild(topbarDom)
		activityDom.appendChild(containerDom)
		new Feed("/api/feed/all",feedDom,feedDom)
		document.body.appendChild(activityDom)
	}
	else if (type=="member"){
		history.pushState("","","/member/"+params.mid)
		let activityDom = activity("member")
		let front = activityDom.childNodes[1]
		let overviewDom = document.createElement('div')
		overviewDom.className = "overview"
		let feedDom = document.createElement('div')
		feedDom.className = "feed"
		front.appendChild(overviewDom)
		front.appendChild(feedDom)
		new Overview(params.mid,overviewDom,activityDom)
		new Feed("/api/feed/member/"+params.mid,feedDom,front)
		document.body.appendChild(activityDom)

	}
	else if (type=="diary"){
		history.pushState("","","/diary/"+params.fid)
		let activityDom = activity("diary")
		let front = activityDom.childNodes[1]
		let articleDom = document.createElement('div')
		articleDom.className = "article"
		let recommandDom = document.createElement('div')
		recommandDom.className = "recommand"
		front.appendChild(articleDom)
		front.appendChild(recommandDom)
		document.body.appendChild(activityDom)
		new Diary(params.fid,articleDom,activityDom)
		new Recommand(params.fid,recommandDom)
	}
}

window.onload = function (){
	if(window.location.pathname=="/"){
		newActivity("main")
	}
}



window.onpopstate = function (){
	let activities = document.getElementsByClassName("activity")
	let activity = activities.item(activities.length-1)
	let back = activity.childNodes[0]
	let front = activity.childNodes[1]
	back.addEventListener("transitionend", function(){
		activity.parentNode.removeChild(activity)
	}, false);
	back.classList.add("clean")
	if(front.classList.contains("up"))
		front.classList.add("throw")
	else
		front.classList.add("drop")
}