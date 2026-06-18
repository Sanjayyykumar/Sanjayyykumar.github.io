{
	class Details {
		constructor() {
			this.DOM = {};

			const detailsTmpl = `
			<div class="details__bg details__bg--down">
				<button class="details__close"><i class="fas fa-2x fa-times icon--cross tm-fa-close"></i></button>
				<div class="details__description"></div>
			</div>						
			`;

			this.DOM.details = document.createElement('div');
			this.DOM.details.className = 'details';
			this.DOM.details.innerHTML = detailsTmpl;
			// DOM.content.appendChild(this.DOM.details);
			document.getElementById('tm-wrap').appendChild(this.DOM.details);
			this.init();
		}
		init() {
			this.DOM.bgDown = this.DOM.details.querySelector('.details__bg--down');
			this.DOM.description = this.DOM.details.querySelector('.details__description');
			this.DOM.close = this.DOM.details.querySelector('.details__close');

			this.initEvents();
		}
		initEvents() {
			// close page when outside of page is clicked.
			document.body.addEventListener('click', () => this.close());
			// prevent close page when inside of page is clicked, and handle in-modal panel toggles
			this.DOM.bgDown.addEventListener('click', (event) => {
				// Handle clicking the "Send a Message" circular button in top-right
				const sendMsgBtn = event.target.closest('.send-msg-circle-btn');
				if (sendMsgBtn) {
					const thankYouCard = this.DOM.description.querySelector('#thank-you-card');
					const formCard = this.DOM.description.querySelector('#send-msg-form-card');
					const triggerContainer = this.DOM.description.querySelector('.send-msg-trigger-container');
					if (thankYouCard && formCard) {
						thankYouCard.classList.add('hidden');
						formCard.classList.add('show');
					}
					if (triggerContainer) {
						triggerContainer.classList.add('hidden');
					}
					event.stopPropagation();
					return;
				}

				// Handle clicking the close button on the form card
				const formCloseBtn = event.target.closest('.form-close-btn');
				if (formCloseBtn) {
					const thankYouCard = this.DOM.description.querySelector('#thank-you-card');
					const formCard = this.DOM.description.querySelector('#send-msg-form-card');
					const triggerContainer = this.DOM.description.querySelector('.send-msg-trigger-container');
					if (thankYouCard && formCard) {
						formCard.classList.remove('show');
						thankYouCard.classList.remove('hidden');
					}
					if (triggerContainer) {
						triggerContainer.classList.remove('hidden');
					}
					event.stopPropagation();
					return;
				}

				// Default propagation stop to prevent modal close when clicking inside
				event.stopPropagation();
			});
			// close page when cross button is clicked.
			this.DOM.close.addEventListener('click', () => this.close());
		}
		fill(info) {
			// fill current page info
			this.DOM.description.innerHTML = info.description;
		}		
		getProductDetailsRect(){
			var p = 0;
			var d = 0;

			try {
				p = this.DOM.productBg.getBoundingClientRect();
				d = this.DOM.bgDown.getBoundingClientRect();	
			}
			catch(e){}

			return {
				productBgRect: p,
				detailsBgRect: d
			};
		}
		open(data) {
			if(this.isAnimating) return false;
			this.isAnimating = true;

			this.DOM.details.style.display = 'block';  

			this.DOM.details.classList.add('details--open');

			// Hide quick actions overlay if open, and hide circular button
			const qaOverlay = document.getElementById('quick-actions-overlay');
			if (qaOverlay) {
				qaOverlay.classList.remove('show');
			}
			const qaBtn = document.getElementById('quick-actions-btn');
			if (qaBtn) {
				qaBtn.classList.add('hidden');
			}

			this.DOM.productBg = data.productBg;

			this.DOM.productBg.style.opacity = 0;

			const rect = this.getProductDetailsRect();

			this.DOM.bgDown.style.transform = `translateX(${rect.productBgRect.left-rect.detailsBgRect.left}px) translateY(${rect.productBgRect.top-rect.detailsBgRect.top}px) scaleX(${rect.productBgRect.width/rect.detailsBgRect.width}) scaleY(${rect.productBgRect.height/rect.detailsBgRect.height})`;
            this.DOM.bgDown.style.opacity = 1;

            // animate background
            anime({
                targets: [this.DOM.bgDown],
                duration: 180,
                easing: 'easeOutSine',
                translateX: 0,
                translateY: 0,
                scaleX: 1,
                scaleY: 1,                              
                complete: () => this.isAnimating = false
            });

            // animate content
            anime({
                targets: [this.DOM.description],
                duration: 250,
                easing: 'easeOutQuart',                
                translateY: [30, 0],
                opacity: 1
            });

            // animate close button
            anime({
                targets: this.DOM.close,
                duration: 150,
                easing: 'easeOutSine',
                translateY: [15, 0],
                opacity: 1
            });

            this.setCarousel();

            window.addEventListener("resize", this.setCarousel);
		}
		close() {
			if (!this.DOM.details.classList.contains('details--open')) return;
			if(this.isAnimating) return false;
			this.isAnimating = true;

			this.DOM.details.classList.remove('details--open');

			anime({
                targets: this.DOM.close,
                duration: 150,
                easing: 'easeOutSine',
                translateY: 15,
                opacity: 0
            });

            anime({
                targets: [this.DOM.description],
                duration: 20,
                easing: 'linear',
                opacity: 0
            });

            const rect = this.getProductDetailsRect();
            anime({
                targets: [this.DOM.bgDown],
                duration: 180,
                easing: 'easeOutSine',                
                translateX: (target, index) => {
                    return index ? rect.productImgRect.left-rect.detailsImgRect.left : rect.productBgRect.left-rect.detailsBgRect.left;
                },
                translateY: (target, index) => {
                    return index ? rect.productImgRect.top-rect.detailsImgRect.top : rect.productBgRect.top-rect.detailsBgRect.top;
                },
                scaleX: (target, index) => {
                    return index ? rect.productImgRect.width/rect.detailsImgRect.width : rect.productBgRect.width/rect.detailsBgRect.width;
                },
                scaleY: (target, index) => {
                    return index ? rect.productImgRect.height/rect.detailsImgRect.height : rect.productBgRect.height/rect.detailsBgRect.height;
                },
                complete: () => {
                    this.DOM.bgDown.style.opacity = 0;
                    this.DOM.bgDown.style.transform = 'none';
                    this.DOM.productBg.style.opacity = 1;
                    this.DOM.details.style.display = 'none';                    
                    this.isAnimating = false;
                    
                    const qaBtn = document.getElementById('quick-actions-btn');
                    if (qaBtn) {
                        qaBtn.classList.remove('hidden');
                    }
                    const detailsDesc = this.DOM.description;
                    if (detailsDesc) {
                        const thankYouCard = detailsDesc.querySelector('#thank-you-card');
                        const formCard = detailsDesc.querySelector('#send-msg-form-card');
                        const triggerContainer = detailsDesc.querySelector('.send-msg-trigger-container');
                        if (thankYouCard && formCard) {
                            formCard.classList.remove('show');
                            thankYouCard.classList.remove('hidden');
                        }
                        if (triggerContainer) {
                            triggerContainer.classList.remove('hidden');
                        }
                    }
                }
            });
		}
		// Slick Carousel
        setCarousel() {
          
	        var slider = $('.details .tm-img-slider');

	        if(slider.length) { // check if slider exist

		        if (slider.hasClass('slick-initialized')) {
		            slider.slick('destroy');
		        }

		        if($(window).width() > 991){
		            // Slick carousel desktop
		            slider.slick({
		                dots: true,
		                infinite: false,
		                slidesToShow: 3,
		                slidesToScroll: 1
		            });
		        }
		        else if($(window).width() > 576){
		            // Slick carousel tablet
		            slider.slick({
		                dots: true,
		                infinite: false,
		                slidesToShow: 2,
		                slidesToScroll: 1
		            });
		        }
		        else {
		            // Slick carousel mobile
		            slider.slick({
			            dots: true,
			            infinite: false,
			            slidesToShow: 1,
			            slidesToScroll: 1
		        	});
		     	}	
	        }          
        }
	}; // class Details

	class Item {
		constructor(el) {
			this.DOM = {};
			this.DOM.el = el;
			this.DOM.product = this.DOM.el.querySelector('.product');
			this.DOM.productBg = this.DOM.product.querySelector('.product__bg');

			this.info = {
				description: this.DOM.product.querySelector('.product__description').innerHTML
			};

			this.initEvents();
		}
		initEvents() {
			this.DOM.product.addEventListener('click', () => this.open());
		}
		open() {
			DOM.details.fill(this.info);
			DOM.details.open({
				productBg: this.DOM.productBg
			});
		}
	}; // class Item

	const DOM = {};
	DOM.grid = document.querySelector('.grid');
	DOM.content = DOM.grid.parentNode;
	DOM.gridItems = Array.from(DOM.grid.querySelectorAll('.grid__item'));
	let items = [];
	DOM.gridItems.forEach(item => items.push(new Item(item)));

	DOM.details = new Details();
};

document.addEventListener("DOMContentLoaded", () => {
    // 1. Split Title Letters (adding delay offsets for continuous wave effect)
    const titleEl = document.querySelector('.rainbow-text');
    if (titleEl) {
        const text = titleEl.textContent;
        titleEl.innerHTML = '';
        let i = 0;
        for (let char of text) {
            const span = document.createElement('span');
            span.innerHTML = char === ' ' ? '&nbsp;' : char;
            span.style.animationDelay = `${i * 0.12}s`;
            titleEl.appendChild(span);
            i++;
        }
    }

    // 2. Shatter Canvas & Physics
    const gate = document.getElementById('entrance-gate');
    const canvas = document.getElementById('shatter-canvas');
    if (!gate || !canvas) {
        // Trigger main animations immediately if gate or canvas are missing
        triggerMainAnimations();
        return;
    }

    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Shard {
        constructor(p1, p2, p3, mouseX, mouseY) {
            this.p1 = { x: p1.x, y: p1.y };
            this.p2 = { x: p2.x, y: p2.y };
            this.p3 = { x: p3.x, y: p3.y };
            
            // Center of mass
            this.cx = (this.p1.x + this.p2.x + this.p3.x) / 3;
            this.cy = (this.p1.y + this.p2.y + this.p3.y) / 3;

            // Vector from mouse click point
            const dx = this.cx - mouseX;
            const dy = this.cy - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            // Force depends on distance from click
            const force = Math.max(0, 16 - dist / 80);
            const angle = Math.atan2(dy, dx);

            // Shard velocities
            this.vx = Math.cos(angle) * force + (Math.random() - 0.5) * 4;
            this.vy = Math.sin(angle) * force + (Math.random() - 0.5) * 4 - 3; // launch slightly upward
            this.gravity = 0.45;
            this.friction = 0.98;
            this.rotSpeed = (Math.random() - 0.5) * 0.05;
            this.alpha = 1.0;
            this.fadeSpeed = 0.01 + Math.random() * 0.015;
        }

        update() {
            // Physics movement
            this.vx *= this.friction;
            this.vy *= this.friction;
            this.vy += this.gravity;

            // Apply translation velocities to vertices
            this.p1.x += this.vx; this.p1.y += this.vy;
            this.p2.x += this.vx; this.p2.y += this.vy;
            this.p3.x += this.vx; this.p3.y += this.vy;

            // Recalculate center
            const oldCx = this.cx;
            const oldCy = this.cy;
            this.cx = (this.p1.x + this.p2.x + this.p3.x) / 3;
            this.cy = (this.p1.y + this.p2.y + this.p3.y) / 3;

            // Apply rotation around center of mass
            const rotatePoint = (p, cx, cy, angle) => {
                const s = Math.sin(angle);
                const c = Math.cos(angle);
                const px = p.x - cx;
                const py = p.y - cy;
                const nx = px * c - py * s;
                const ny = px * s + py * c;
                p.x = nx + cx;
                p.y = ny + cy;
            };

            rotatePoint(this.p1, this.cx, this.cy, this.rotSpeed);
            rotatePoint(this.p2, this.cx, this.cy, this.rotSpeed);
            rotatePoint(this.p3, this.cx, this.cy, this.rotSpeed);

            // Fade out
            this.alpha -= this.fadeSpeed;
            return this.alpha > 0;
        }

        draw(ctx) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(this.p1.x, this.p1.y);
            ctx.lineTo(this.p2.x, this.p2.y);
            ctx.lineTo(this.p3.x, this.p3.y);
            ctx.closePath();
            
            // Glass fill & stroke colors
            ctx.fillStyle = `rgba(113, 235, 251, ${this.alpha * 0.15})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(255, 255, 255, ${this.alpha * 0.45})`;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
        }
    }

    let shards = [];
    let isShattering = false;

    gate.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isShattering) return;
        isShattering = true;

        // Hide gate text details panels
        const content = gate.querySelector('.entrance-content');
        if (content) {
            content.style.opacity = 0;
            content.style.transform = "scale(0.8)";
            setTimeout(() => content.style.display = 'none', 500);
        }

        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // Generate triangular shards
        const cols = 12;
        const rows = 10;
        const cellW = window.innerWidth / cols;
        const cellH = window.innerHeight / rows;

        // Generate grid points with random offsets
        let points = [];
        for (let r = 0; r <= rows; r++) {
            points[r] = [];
            for (let c = 0; c <= cols; c++) {
                let offsetX = 0;
                let offsetY = 0;
                if (r > 0 && r < rows) offsetY = (Math.random() - 0.5) * (cellH * 0.4);
                if (c > 0 && c < cols) offsetX = (Math.random() - 0.5) * (cellW * 0.4);
                
                points[r][c] = {
                    x: c * cellW + offsetX,
                    y: r * cellH + offsetY
                };
            }
        }

        // Create 2 triangles per grid rectangle
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const tl = points[r][c];
                const tr = points[r][c+1];
                const bl = points[r+1][c];
                const br = points[r+1][c+1];

                shards.push(new Shard(tl, tr, bl, mouseX, mouseY));
                shards.push(new Shard(tr, br, bl, mouseX, mouseY));
            }
        }

        // Run Canvas Shatter loop
        function animateShatter() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let activeParticles = 0;

            for (let i = 0; i < shards.length; i++) {
                const shard = shards[i];
                if (shard.update()) {
                    shard.draw(ctx);
                    activeParticles++;
                }
            }

            if (activeParticles > 0) {
                requestAnimationFrame(animateShatter);
            } else {
                // Destroy gate overlay DOM
                gate.parentNode.removeChild(gate);
                document.body.classList.remove('scroll-locked');
                
                // Trigger main page visit animations
                triggerMainAnimations();
            }
        }
        animateShatter();
    });

    function triggerMainAnimations() {
        if (typeof anime === 'undefined') {
            // Fallback: make sure title is visible if anime is not loaded
            const titleSpans = document.querySelectorAll('.rainbow-text span');
            titleSpans.forEach(span => span.style.opacity = '1');
            const cards = document.querySelectorAll('.grid__item');
            cards.forEach(card => card.style.opacity = '1');
            return;
        }

        // Reset grid item cards starting state
        const cards = document.querySelectorAll('.grid__item');
        cards.forEach(card => {
            card.style.opacity = '0';
        });

        // 1. Animate Title Characters (Using anime.js v2 compatible delay function)
        anime({
            targets: '.rainbow-text span',
            translateY: [20, 0],
            scale: [0.9, 1],
            opacity: [0, 1],
            delay: (el, i) => i * 15,
            duration: 450,
            easing: 'easeOutBack',
            complete: () => {
                // Clear inline transform to allow continuous CSS bounce wave animation to run smoothly
                const spans = document.querySelectorAll('.rainbow-text span');
                spans.forEach(span => {
                    span.style.transform = '';
                });
            }
        });

        // 2. Animate Title line and subtext
        anime({
            targets: ['.tm-site-header img', '.tm-site-header p'],
            translateY: [15, 0],
            opacity: [0, 1],
            delay: 150,
            duration: 400,
            easing: 'easeOutQuad'
        });

        // 3. Animate grid item cards (Using anime.js v2 compatible delay function)
        anime({
            targets: '.grid__item',
            translateY: [30, 0],
            opacity: [0, 1],
            delay: (el, i) => 200 + i * 50,
            duration: 550,
            easing: 'easeOutBack'
        });

        // 4. Animate Quick Actions Circle Button
        const qaBtn = document.getElementById('quick-actions-btn');
        if (qaBtn) {
            qaBtn.style.opacity = '0';
            qaBtn.style.transform = 'scale(0)';
            anime({
                targets: qaBtn,
                scale: [0, 1],
                opacity: [0, 1],
                delay: 350,
                duration: 400,
                easing: 'easeOutBack'
            });
        }
    }

    // 3. Quick Actions Overlay Trigger & Outside Click Close
    const qaTrigger = document.getElementById('quick-actions-btn');
    const qaOverlay = document.getElementById('quick-actions-overlay');
    const qaClose = document.getElementById('notification-close-btn');

    if (qaTrigger && qaOverlay) {
        qaTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            qaOverlay.classList.toggle('show');
        });
    }

    if (qaClose && qaOverlay) {
        qaClose.addEventListener('click', (e) => {
            e.stopPropagation();
            qaOverlay.classList.remove('show');
        });
    }

    document.addEventListener('click', (e) => {
        if (qaOverlay && qaOverlay.classList.contains('show')) {
            const dialog = qaOverlay.querySelector('.quick-actions-dialog');
            if (dialog && !dialog.contains(e.target) && e.target !== qaTrigger) {
                qaOverlay.classList.remove('show');
            }
        }
    });

});


