function Diary(fid,articleDom,activityDom){
	let topbarDom
	let topbarDomHeight
	let back = activityDom.childNodes[0]
	let front = activityDom.childNodes[1]
	let height = activityDom.scrollHeight

	ajaxRequest("GET",`/api/diary/${fid}`,function(responseText){
		let diary = JSON.parse(responseText)
		buildArticle(articleDom,diary)
		topbarDom = articleDom.getElementsByClassName("topbar")[0]
		topbarDomHeight = topbarDom.scrollHeight
	})
	
	let beforeScroll = front.scrollTop
	let translateY = 0

	function topbarFollow(){
		topbarDom.style.transform = `translateY(${translateY}px)`
	}

	front.addEventListener("scroll", function()	{
		let afterScroll = this.scrollTop
		let delta = beforeScroll - afterScroll

		beforeScroll = afterScroll
		translateY += delta
		if(translateY > 0)
			translateY = 0
		else if(translateY < - topbarDomHeight)
			translateY = -topbarDomHeight
		topbarFollow()
	})
	
	let actionQuit = null
	let startY = 0
	let moveY = 0
	let locked = false
	// let startX
	// let moveX

	front.addEventListener('touchstart',touchStart,{passive:true})
	front.addEventListener('touchmove',touchMove,{passive:true})
	front.addEventListener('touchend',touchEnd,{passive:true})

	function touchStart(event){
		startY = event.targetTouches[0].pageY
		// startX = event.targetTouches[0].pageX

		if (front.scrollTop == 0){
			actionQuit = "down"
		}
		else if(front.scrollTop+front.offsetHeight == front.scrollHeight){
			actionQuit = "up"
		}
		else{
			actionQuit = null
			topbarDom.classList.add("change")
		}
		if (actionQuit != null){
			front.classList.add("change")
			back.classList.add("change")
		}
	}

	function touchMove(event){
		if (actionQuit == null){
			return
		}

		moveY = event.targetTouches[0].pageY - startY
		// moveX = event.targetTouches[0].pageX - startX

		// if (Math.abs(moveX)>30 && actionQuit != null){
		// 	cancelQuit()
		// 	actionQuit = null
		// 	return
		// }

		if (locked){
			if(actionQuit == "down")
				moveY = moveY > 0 ? moveY : 0
			else if(actionQuit == "up")
				moveY = moveY < 0 ? moveY : 0
			front.style.transform = `translateY(${moveY}px)`
			back.style.backgroundColor = `rgba(0,0,0,${0.8-Math.abs(moveY/height)})`
		}
		else if (actionQuit == "down" && moveY > 0){
			locked = true
			front.classList.add("lock")
		}
		else if (actionQuit == "up" && moveY < 0){
			locked = true
			front.classList.add("lock")
		}
		else{
			cancelQuit()
			topbarDom.classList.add("change")
		}
	}

	function cancelQuit(){
		front.classList.remove("lock")
		front.classList.remove("change")
		back.classList.remove("change")
		front.style.transform = null
		back.style.backgroundColor = null
		actionQuit = null
		locked = false
	}

	function touchEnd(event){
		if(actionQuit == "down" && moveY < 120){
			cancelQuit()
		}
		else if(actionQuit == "up" && moveY > -120){
			cancelQuit()
		}
		else if(actionQuit != null){
			front.classList.add(actionQuit)
			history.back(-1)
		}
		else{
			if (translateY <= -topbarDomHeight / 2)
				translateY = -topbarDomHeight
			else
				translateY = 0
			topbarDom.classList.remove("change")
			topbarFollow()
		}
	}
}


function CloseButton(){
	let button = document.createElement('button')
	button.className = "close"
	button.onclick = function (event){
		event.stopPropagation()
		history.back(-1) | window.close()
	}
	return button
}


function buildArticle(articleDom,diary){
	let topbarDom = document.createElement('div')
	topbarDom.className = "topbar"
	let closeButton = new CloseButton()
	let fillDom = document.createElement('div')
	fillDom.className = "fill"
	let shareButton = document.createElement('button')
	shareButton.className = "share"
	let heartButton = document.createElement('button')
	heartButton.className = "heart"
	let openButton = document.createElement('button')
	openButton.className = "open"
	let favorDom = document.createElement('div')
	favorDom.className = "favor"
	let countDom = document.createElement('div')
	countDom.className = "count"
	countDom.innerHTML = (diary.favors == 0) ? '' : diary.favors
	let favorButton = new FavorButton(diary.fid,diary.favored,countDom)
	favorDom.appendChild(favorButton)
	favorDom.appendChild(countDom)
	topbarDom.appendChild(closeButton)
	topbarDom.appendChild(fillDom)
	topbarDom.appendChild(shareButton)
	topbarDom.appendChild(favorDom)
	topbarDom.appendChild(openButton)
	articleDom.appendChild(topbarDom)

	topbarDom.onclick = function (){
		toTop(articleDom.parentNode)
	}

	shareButton.onclick = function (event){
		event.stopPropagation()
		navigator.share({
			title: document.title,
			text: `${diary.title} | ${diary.author.name}`,
			url: window.location.href 
		})
		// .then(function(){console.log('Successfully shared')})
		.catch(function(error){console.log('Error sharing:', error)})
	}
	
	openButton.onclick = function (event){
		event.stopPropagation()
		window.open(diary.link)
	}

	let headerDom = document.createElement('div')
	headerDom.className = "header"
	let avatarDom = document.createElement('div')
	avatarDom.className = "avatar"
	let titleDom = document.createElement('div')
	titleDom.className = "title"
	let infoDom = document.createElement('div')
	infoDom.className = "info"
	let separatorDom = document.createElement('div')
	separatorDom.className = "separator"

	avatarDom.style.backgroundImage = `url(https://dev.aidoru.tk${diary.author.avatar}`
	titleDom.innerHTML = diary.title
	infoDom.innerHTML = `${diary.author.name} · ${diary.author.affiliation}  · ${timeFormat(new Date(diary.post))}`
	separatorDom.innerHTML = '~'

	headerDom.appendChild(avatarDom)
	headerDom.appendChild(titleDom)
	headerDom.appendChild(infoDom)
	headerDom.appendChild(separatorDom)
	articleDom.appendChild(headerDom)

	let textDom = document.createElement('div')
	textDom.className = "text"
	textDom.appendChild(typesetting(diary.text))
	articleDom.appendChild(textDom)

}


function typesetting(text){
	let items = []
	let article = document.createDocumentFragment()
	text = text.split("<br>")
	let imgTag = /<img[^>]+>/g
	for(let i=0;i<text.length;i++){
		if(text[i]==""){
			let paragraph = document.createElement("p")
			paragraph.appendChild(document.createElement("br"))
			article.appendChild(paragraph)
		}
		else if(!imgTag.test(text[i])){
			let paragraph = document.createElement("p")
			paragraph.innerHTML = text[i]
			article.appendChild(paragraph)
		}
		else{
			let imgs = text[i].match(imgTag)
			let parts = text[i].split(imgTag)
			let paragraph = document.createElement("p")
			for(let j=0;j<parts.length-1;j++){
				paragraph.innerHTML += parts[j]
				let nextImgSrc = "https://dev.aidoru.tk" + imgs[j].match(/src="([^"]+)"/)[1]
				let nextImgSize = imgs[j].match(/size="([^"]+)"/)[1].split("x")
				// if (nextImgSize[0]>=500||nextImgSize[1]>=500){
				if (nextImgSize[0]>=200){
					article.appendChild(paragraph)
					let largeImg = document.createElement("img")
					largeImg.className = "large"
					largeImg.src = nextImgSrc
					article.appendChild(largeImg)
					paragraph = document.createElement("p")
					items.push({
						msrc: nextImgSrc,
						src: nextImgSrc,
						w: parseInt(nextImgSize[0]),
						h: parseInt(nextImgSize[1]),
						el: largeImg
					})
					let imgIndex = items.length - 1
					largeImg.onclick = function(){
						openGallery(imgIndex, items)
					}
				}
				else{
					let img = document.createElement("img")
					img.src = nextImgSrc
					console.log(nextImgSrc)
					paragraph.appendChild(img)
				}
			}
			paragraph.innerHTML += parts[parts.length-1]
			if (paragraph.innerHTML != ""){
				article.appendChild(paragraph)
			}
		}
	}
	return article
}

let galleryOpened = false

function openGallery(index, items) {
	galleryOpened = true
	let pswpElement = document.querySelectorAll('.pswp')[0]
	let options = {
		getThumbBoundsFn: function(index) {
			let element = items[index].el
			let pageYScroll = window.pageYOffset || document.documentElement.scrollTop
			let rect = element.getBoundingClientRect()
			return {x:rect.left, y:rect.top + pageYScroll, w:rect.width}
		},
		index: index,
		loop: false
	}
	let gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options)
	gallery.init()
}


function diaryAnimate(element){
	let rect = element.getBoundingClientRect()
	let animate = document.styleSheets[5].rules[0]
	animate.findRule('0%').style.transform = `translateY(${rect.top}px)`
	animate.findRule('0%').style.height = `${rect.height}px`
	animate.findRule('50%').style.transform = `translateY(${rect.top}px)`
	animate.findRule('50%').style.height = `${rect.height}px`
}



// <div class="recommand">
// 	<div class="separator">~</div>
// 	<div class="pool">
// 		<div class="block">
// 			<div class="title">高露洁固齿防蛀牙膏</div>
// 			<div class="author">
// 				<div class="avatar"></div>
// 				<div class="name">IT之家</div>
// 			</div>
// 		</div>
// 		<div class="block"></div>
// 		<div class="block"></div>
// 		<div class="block"></div>
// 		<div class="block"></div>
// 	</div>
// </div>



function Recommand(fid,recommandDom){
	ajaxRequest("GET",`/api/related/${fid}`,function(responseText){
		let recommand = JSON.parse(responseText)
		buildRecommand(recommandDom,recommand)
	})
}


function buildRecommand(recommandDom,recommand){
	let separator = document.createElement("div")
	separator.className = "separator"
	separator.innerHTML = "更多有趣内容"

	let pool = document.createElement("div")
	pool.className = "pool"

	let fragment = document.createDocumentFragment()
	for(let i=0;i<recommand.length;i++){
		let block = document.createElement("div")
		block.className = "block"
		let image = document.createElement("div")
		image.className = "image"
		let title = document.createElement("div")
		title.className = "title"
		let author = document.createElement("div")
		author.className = "author"
		let avatar = document.createElement("div")
		avatar.className = "avatar"
		let name = document.createElement("div")
		name.className = "name"

		image.style.backgroundImage = `url(https://dev.aidoru.tk${recommand[i].image})`
		title.innerHTML = recommand[i].title
		avatar.style.backgroundImage = `url(https://dev.aidoru.tk${recommand[i].author.avatar})`
		name.innerHTML = recommand[i].author.name

		block.onclick = function(){
			diaryAnimate(this)
			newActivity('diary',{'fid':recommand[i].fid})
		}

		block.appendChild(image)
		block.appendChild(title)
		author.appendChild(avatar)
		author.appendChild(name)
		block.appendChild(author)
		fragment.appendChild(block)
	}
	pool.appendChild(fragment)
	recommandDom.appendChild(separator)
	recommandDom.appendChild(pool)

}