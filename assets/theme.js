(function() {
  var Main, el,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  theme.classes.FrameworkArticle = (function() {
    function FrameworkArticle(root) {
      var _this;
      this.root = root;
      this.initializeDisqus = bind(this.initializeDisqus, this);
      this.hideTagInfo = bind(this.hideTagInfo, this);
      this.load = bind(this.load, this);
      _this = this;
      _this.comments_enabled = _this.root.data('comments-enabled');
      _this.disqus_shortname = _this.root.attr('data-disqus-shortname');
      _this.enable_disqus = _this.root.data('enable-disqus');
      _this.no_tags_displayed = _this.root.find('.article--tag').length === 0 ? true : false;
      _this.load();
    }

    FrameworkArticle.prototype.load = function() {
      var _this;
      _this = this;
      if (_this.no_tags_displayed) {
        _this.hideTagInfo();
      }
      if (_this.enable_disqus && _this.comments_enabled) {
        return _this.initializeDisqus();
      }
    };

    FrameworkArticle.prototype.hideTagInfo = function() {
      var _this;
      _this = this;
      return _this.root.find('.article--tag-info').hide();
    };

    FrameworkArticle.prototype.initializeDisqus = function() {
      var _this;
      _this = this;
      return theme.utils.insertScript("https://" + _this.disqus_shortname + ".disqus.com/embed.js");
    };

    return FrameworkArticle;

  })();

  theme.classes.FrameworkBlog = (function() {
    function FrameworkBlog(root) {
      var _this;
      this.root = root;
      this.initMasonry = bind(this.initMasonry, this);
      this.eventListeners = bind(this.eventListeners, this);
      this.load = bind(this.load, this);
      _this = this;
      _this.list = _this.root.find('.blog--list');
      if (_this.root.data('columns') > 1) {
        _this.load();
      }
    }

    FrameworkBlog.prototype.load = function() {
      var _this;
      _this = this;
      return theme.utils.insertScript(theme.assets.masonry, function() {
        if (theme.utils.mqs.current_window !== 'small') {
          _this.initMasonry();
        }
        return _this.eventListeners();
      });
    };

    FrameworkBlog.prototype.eventListeners = function() {
      var _this;
      _this = this;
      return window.addEventListener('theme:utils:mqs:updated', function() {
        var masonry_loaded;
        masonry_loaded = _this.list.data('masonry-loaded');
        if (!(theme.utils.mqs.current_window === 'small' || masonry_loaded)) {
          return _this.initMasonry();
        } else if (theme.utils.mqs.current_window === 'small' && masonry_loaded) {
          _this.list.attr('data-masonry-loaded', false);
          return _this.masonry.destroy();
        }
      });
    };

    FrameworkBlog.prototype.initMasonry = function() {
      var _this;
      _this = this;
      _this.list.attr('data-masonry-loaded', true);
      return _this.masonry = new Masonry(_this.list.el[0], {
        itemSelector: '.blog--list--item',
        percentPosition: true,
        horizontalOrder: true,
        columnWidth: '.blog--list--item'
      });
    };

    return FrameworkBlog;

  })();

  theme.classes.FrameworkCarousel = (function() {
    function FrameworkCarousel(root) {
      var _this;
      this.root = root;
      this.toggleFocusableEl = bind(this.toggleFocusableEl, this);
      this.toggleDraggable = bind(this.toggleDraggable, this);
      this.getAllFocusableEl = bind(this.getAllFocusableEl, this);
      _this = this;
      _this.container = _this.root.find('.carousel--x-container');
      _this.dot_nav = _this.root.find('.carousel--dot-nav');
      _this.dot_nav_wrapper = _this.root.find('.carousel--dot-nav--wrapper');
      _this.dots = _this.root.find('.carousel--dot');
      _this.height_container = _this.root.find('.carousel--y-container');
      _this.links = _this.container.find('a');
      _this.next = _this.root.find('.carousel--next');
      _this.prev = _this.root.find('.carousel--prev');
      _this.at_end = _this.root.attr('data-at-end');
      _this.at_start = _this.root.attr('data-at-start');
      _this.auto_rotate = _this.root.data('auto-rotate');
      _this.blocks = _this.root.find('.carousel--block');
      _this.blocks_per_slide_desktop = _this.root.data('blocks-per-slide');
      _this.blocks_per_slide_mobile = _this.root.data('blocks-per-slide--mobile');
      _this.dot_nav_enabled = _this.root.attr('data-dot-nav');
      _this.rotate_frequency = _this.root.attr('data-rotate-frequency');
      _this.section_id = _this.root.closest('[data-section-id]').data('section-id');
      _this.total_blocks = _this.blocks.length;
      _this.transition_type = _this.root.attr('data-transition-type');
      _this.view = _this.root.data('view');
      _this.active_slide = 1;
      _this.autoplay_focus_enabled = false;
      _this.slide_pause = false;
      _this.container_destination = '0px';
      _this.trailing_dot_index = 0;
      _this.leading_dot_index = 0;
      _this.dot_nav_offset = 0;
      _this.draggable = true;
      _this.active_blocks = null;
      _this.auto_slide_timer = null;
      _this.blocks_per_slide = null;
      _this.old_active_blocks = null;
      _this.screen_size_loaded = null;
      _this.slide_count = null;
      _this.swipe_state = null;
      _this.window_width = null;
      _this.dot_change_type = null;
      theme.carousels[_this.section_id] = this;
      _this.load();
    }

    FrameworkCarousel.prototype.load = function() {
      var _this;
      _this = this;
      _this.resizeListener();
      _this.initNewScreenSize();
      _this.getAllFocusableEl();
      _this.updateActive();
      _this.setSliderHeight();
      _this.mouseDownListener();
      _this.swipeListener();
      _this.arrowNavListeners();
      _this.blockListener();
      if (_this.transition_type === 'slide') {
        _this.loadBlocks();
      }
      if (_this.auto_rotate) {
        _this.autoSlide();
        _this.stopAutoSlideWhenInteracting();
      }
      return _this.root.trigger('loaded');
    };

    FrameworkCarousel.prototype.initNewScreenSize = function() {
      var _this;
      _this = this;
      if (theme.utils.mqs.current_window === 'small') {
        if (_this.screen_size_loaded === 'small') {
          return;
        }
        _this.dot_nav.attr('data-loaded', 'false');
        _this.screen_size_loaded = 'small';
        _this.blocks_per_slide = _this.blocks_per_slide_mobile;
        _this.active_slide = Math.ceil((_this.blocks_per_slide_desktop * (_this.active_slide - 1) + 1) / _this.blocks_per_slide_mobile);
      } else {
        if (_this.screen_size_loaded === 'medium-large') {
          return;
        }
        _this.screen_size_loaded = 'medium-large';
        _this.blocks_per_slide = _this.blocks_per_slide_desktop;
        _this.active_slide = Math.ceil((_this.blocks_per_slide_mobile * (_this.active_slide - 1) + 1) / _this.blocks_per_slide_desktop);
      }
      _this.slide_count = Math.ceil(_this.total_blocks / _this.blocks_per_slide);
      _this.createDotNav();
      _this.dotNavListeners();
      _this.goToActiveSlide();
      return _this.updateActiveDot();
    };

    FrameworkCarousel.prototype.getAllFocusableEl = function() {
      var _this;
      _this = this;
      return _this.focusable_el = theme.utils.getFocusableEl(_this.root);
    };

    FrameworkCarousel.prototype.loadBlocks = function() {
      var _this;
      _this = this;
      return _this.blocks.each(function(block) {
        el(block).attr('data-loaded', 'true');
        return el(block).attr('data-loaded--mobile', 'true');
      });
    };

    FrameworkCarousel.prototype.blockListener = function() {
      var _this;
      _this = this;
      return _this.blocks.on('theme:block:select', function() {
        _this.active_slide = Math.ceil((el(this).index() + 1) / _this.blocks_per_slide);
        _this.updateActive();
        _this.goToActiveSlide(true);
        _this.updateActiveDot();
        return _this.setSliderHeight();
      });
    };

    FrameworkCarousel.prototype.toggleDraggable = function(toggle) {
      var _this;
      if (toggle == null) {
        toggle = 'opposite';
      }
      _this = this;
      if (toggle === 'opposite') {
        _this.draggable = !_this.draggable;
      }
      if (toggle === true) {
        return _this.draggable = true;
      } else if (toggle === false) {
        return _this.draggable = false;
      }
    };

    FrameworkCarousel.prototype.checkForActiveModel = function(target) {
      var _this, model, model_disabled;
      _this = this;
      model = el(target.closest('model-viewer'));
      if (model.length) {
        model_disabled = model.hasClass('shopify-model-viewer-ui__disabled');
        if (!model_disabled) {
          return true;
        }
      }
      return false;
    };

    FrameworkCarousel.prototype.mouseDownListener = function() {
      var _this;
      _this = this;
      return _this.container.on('mousedown touchstart', function(event) {
        if (_this.checkForActiveModel(event.target) || !_this.draggable) {
          return false;
        }
        _this.swipe_state = 'swipe-started';
        _this.reenableClickAfterSwiping();
        _this.mouseUpListener();
        _this.slide_pause = true;
        if (_this.transition_type === 'slide') {
          _this.drag_start = event.pageX;
          _this.container_x = _this.container.css('transform').replace(/[^0-9\-.,]/g, '').split(',')[4];
          _this.container.attr('data-transition', '');
          _this.container.css('transform', "translateX(" + _this.container_x + "px)");
          return _this.dragBegin();
        }
      }, true);
    };

    FrameworkCarousel.prototype.mouseUpListener = function() {
      var _this;
      _this = this;
      return theme.window.on("mouseup." + _this.section_id + " touchend." + _this.section_id, function() {
        _this.swipe_state = 'swipe-ended';
        _this.removeMouseUpListener();
        _this.dragEnd();
        if (_this.slide_pause === true) {
          _this.container.attr('data-transition', 'forwards');
          return _this.container.css('transform', "translateX(" + _this.container_destination + ")");
        }
      }, true);
    };

    FrameworkCarousel.prototype.removeMouseUpListener = function() {
      var _this;
      _this = this;
      return theme.window.off("mouseup." + _this.section_id + " touchend." + _this.section_id);
    };

    FrameworkCarousel.prototype.dragBegin = function() {
      var _this;
      _this = this;
      _this.root.attr('data-dragging', 'true');
      return theme.window.on("mousemove." + _this.section_id + " touchmove." + _this.section_id, function(event) {
        var offset, slide_x_start;
        offset = _this.container_x - _this.drag_start + event.pageX;
        slide_x_start = _this.window_width * (_this.slide_count - 1);
        if (offset > 0) {
          return _this.container.css('transform', "translateX(" + (offset / 4) + "px)");
        } else if (offset < slide_x_start * -1) {
          offset = offset * -1;
          offset = slide_x_start + (offset - slide_x_start) / 4;
          return _this.container.css('transform', "translateX(-" + offset + "px)");
        } else {
          return _this.container.css('transform', "translateX(" + offset + "px)");
        }
      }, true);
    };

    FrameworkCarousel.prototype.dragEnd = function() {
      var _this;
      _this = this;
      _this.root.attr('data-dragging', 'false');
      return theme.window.off("mousemove." + _this.section_id + " touchmove." + _this.section_id);
    };

    FrameworkCarousel.prototype.updateContainerDestination = function(index) {
      var _this;
      _this = this;
      return _this.container_destination = (_this.active_slide - 1) / _this.slide_count * -100 + '%';
    };

    FrameworkCarousel.prototype.slideToNext = function(loop_to_start) {
      var _this, transition_direction;
      if (loop_to_start == null) {
        loop_to_start = false;
      }
      _this = this;
      _this.dot_change_type = 'iterate';
      if (_this.active_slide !== _this.slide_count) {
        _this.updateActive('next');
        transition_direction = 'forwards';
      } else if (loop_to_start && _this.active_slide === _this.slide_count) {
        _this.active_slide = 1;
        _this.updateActive();
        transition_direction = 'forwards';
      } else if (_this.active_slide === _this.slide_count) {
        transition_direction = 'backwards';
      }
      if (_this.transition_type === 'slide') {
        _this.updateContainerDestination();
        _this.container.css('transform', "translateX(" + _this.container_destination + ")");
      } else if (_this.transition_type === 'fade') {
        _this.fadeSlides();
      }
      return _this.container.attr('data-transition', transition_direction);
    };

    FrameworkCarousel.prototype.slideToPrev = function() {
      var _this, transition_direction;
      _this = this;
      _this.dot_change_type = 'iterate';
      if (_this.active_slide !== 1) {
        _this.updateActive('prev');
        transition_direction = 'forwards';
      } else if (_this.active_slide === 1) {
        transition_direction = 'backwards';
      }
      if (_this.transition_type === 'slide') {
        _this.updateContainerDestination();
        _this.container.css('transform', "translateX(" + _this.container_destination + ")");
      } else if (_this.transition_type === 'fade') {
        _this.fadeSlides();
      }
      return _this.container.attr('data-transition', transition_direction);
    };

    FrameworkCarousel.prototype.goToActiveSlide = function(animate) {
      var _this;
      if (animate == null) {
        animate = false;
      }
      _this = this;
      _this.dot_change_type = 'init';
      if (_this.transition_type === 'slide') {
        _this.updateContainerDestination();
        _this.container.css('transform', "translateX(" + _this.container_destination + ")");
      } else if (_this.transition_type === 'fade') {
        _this.fadeSlides();
      }
      if (animate) {
        return _this.container.attr('data-transition', 'forwards');
      }
    };

    FrameworkCarousel.prototype.checkStartEnd = function() {
      var _this;
      _this = this;
      if (_this.active_slide === 1) {
        _this.at_start = true;
        _this.prev.attr('tabindex', '-1');
      } else {
        _this.at_start = false;
        _this.prev.attr('tabindex', '0');
      }
      _this.root.attr('data-at-start', _this.at_start);
      if (_this.active_slide === _this.slide_count) {
        _this.at_end = true;
        _this.next.attr('tabindex', '-1');
      } else {
        _this.at_end = false;
        _this.next.attr('tabindex', '0');
      }
      return _this.root.attr('data-at-end', _this.at_end);
    };

    FrameworkCarousel.prototype.updateActive = function(direction) {
      var _this, higher_range, lower_range;
      if (direction == null) {
        direction = false;
      }
      _this = this;
      if (direction === 'next') {
        _this.active_slide += 1;
        if (!(_this.autoplay_focus_enabled === false && _this.auto_rotate)) {
          _this.prev.focus(0);
        }
      } else if (direction === 'prev') {
        _this.active_slide -= 1;
        if (!(_this.autoplay_focus_enabled === false && _this.auto_rotate)) {
          _this.next.focus(0);
        }
      }
      lower_range = (_this.active_slide - 1) * _this.blocks_per_slide;
      higher_range = lower_range + _this.blocks_per_slide;
      if (_this.active_blocks !== null) {
        _this.old_active_blocks = _this.active_blocks;
      }
      _this.active_blocks = el(Array.from(_this.blocks.el).slice(lower_range, higher_range));
      _this.toggleFocusableEl(direction);
      return _this.checkStartEnd();
    };

    FrameworkCarousel.prototype.toggleFocusableEl = function(direction) {
      var _this;
      _this = this;
      if (_this.disabled_el) {
        _this.disabled_el.attr('tabindex', '0');
      }
      _this.disabled_el = theme.utils.getFocusableEl(_this.blocks.not(_this.active_blocks));
      if (_this.disabled_el) {
        return _this.disabled_el.attr('tabindex', '-1');
      }
    };

    FrameworkCarousel.prototype.setSliderHeight = function() {
      var _this, tallest;
      _this = this;
      tallest = 0;
      _this.active_blocks.each(function(block) {
        var height;
        height = el(block).outerHeight();
        if (height > tallest) {
          return tallest = height;
        }
      });
      return _this.height_container.css('height', tallest + "px");
    };

    FrameworkCarousel.prototype.swipeListener = function() {
      var _this;
      _this = this;
      el(document).on('theme:swipe:left', function() {
        if (_this.swipe_state === 'swipe-started') {
          _this.slide_pause = false;
          _this.slideToNext();
          _this.setSliderHeight();
          _this.updateActiveDot();
          return _this.preventClickWhenSwiping();
        }
      });
      return el(document).on('theme:swipe:right', function() {
        if (_this.swipe_state === 'swipe-started') {
          _this.slide_pause = false;
          _this.slideToPrev();
          _this.setSliderHeight();
          _this.updateActiveDot();
          return _this.preventClickWhenSwiping();
        }
      });
    };

    FrameworkCarousel.prototype.createDotNav = function() {
      var _this, carousel_dot, i, j, ref;
      _this = this;
      if (!_this.dot_nav_enabled || _this.slide_count === 1) {
        return;
      }
      _this.dot_nav.empty();
      for (i = j = 1, ref = _this.slide_count; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
        carousel_dot = theme.utils.parseHtml('<div class="carousel--dot"></div>');
        _this.dot_nav.append(carousel_dot);
      }
      _this.dots = _this.root.find('.carousel--dot');
      if (theme.utils.mqs.current_window === 'small') {
        return _this.dots.attr('tabindex', '0');
      }
    };

    FrameworkCarousel.prototype.updateActiveDot = function() {
      var _this;
      _this = this;
      _this.dots.attr('data-active', 'false');
      _this.dots.eq(_this.active_slide - 1).attr('data-active', 'true');
      if (_this.dots.length > 5) {
        return _this.updateTrailingLeadingDots();
      } else {
        _this.alignDots();
        return _this.dot_nav.attr('data-loaded', 'true');
      }
    };

    FrameworkCarousel.prototype.updateTrailingLeadingDots = function() {
      var _this, active, initial_offset, offset_initial;
      _this = this;
      if (_this.active_slide === _this.leading_dot_index) {
        _this.leading_dot_index++;
        _this.trailing_dot_index++;
        active = _this.dots.eq(_this.active_slide - 1);
        active.attr('data-position', '');
        initial_offset = active.offset().left;
        setTimeout(function() {
          _this.dots.eq(_this.active_slide - 4).attr('data-position', 'trailing-1');
          _this.dots.eq(_this.active_slide - 5).attr('data-position', 'trailing-2');
          if (_this.active_slide >= 5) {
            _this.dots.filter(":nth-child(-n+" + (_this.active_slide - 5) + ")").attr('data-position', 'hidden');
          }
          _this.dots.eq(_this.active_slide).attr('data-position', 'leading-1');
          _this.dots.eq(_this.active_slide + 1).attr('data-position', 'leading-2');
          _this.dots.filter(":nth-child(n+" + (_this.active_slide + 3) + ")").attr('data-position', 'hidden');
          _this.alignDots(initial_offset);
          if (_this.dot_change_type === 'init') {
            _this.alignDots();
            return _this.dot_nav.attr('data-loaded', 'true');
          }
        }, 0);
        return setTimeout(function() {
          _this.dot_nav.attr('data-transition', 'true');
          return _this.alignDots();
        }, 200);
      } else if (_this.active_slide === _this.trailing_dot_index) {
        _this.leading_dot_index--;
        _this.trailing_dot_index--;
        active = _this.dots.eq(_this.active_slide - 1);
        active.attr('data-position', '');
        offset_initial = active.offset().left;
        setTimeout(function() {
          _this.dots.eq(_this.active_slide - 2).attr('data-position', 'trailing-1');
          _this.dots.eq(_this.active_slide - 3).attr('data-position', 'trailing-2');
          _this.dots.eq(_this.active_slide + 2).attr('data-position', 'leading-1');
          _this.dots.eq(_this.active_slide + 3).attr('data-position', 'leading-2');
          _this.dots.filter(":nth-child(n+" + (_this.active_slide + 5) + ")").attr('data-position', 'hidden');
          if (_this.active_slide >= 4) {
            _this.dots.filter(":nth-child(-n+" + (_this.active_slide - 2) + ")").attr('data-position', 'hidden');
          }
          _this.alignDots(initial_offset);
          if (_this.dot_change_type === 'init') {
            _this.alignDots();
            return _this.dot_nav.attr('data-loaded', 'true');
          }
        }, 0);
        return setTimeout(function() {
          _this.dot_nav.attr('data-transition', 'true');
          return _this.alignDots();
        }, 200);
      } else if (_this.dot_change_type === 'init') {
        _this.dots.attr('data-position', '');
        if (_this.slide_count - _this.active_slide <= 2) {
          _this.leading_dot_index = _this.active_slide;
          _this.trailing_dot_index = _this.active_slide - 3;
        } else if (_this.slide_count - _this.active_slide > 2) {
          _this.trailing_dot_index = _this.active_slide;
          _this.leading_dot_index = _this.active_slide + 3;
        }
        return _this.updateTrailingLeadingDots();
      }
    };

    FrameworkCarousel.prototype.alignDots = function(offset_initial) {
      var _this, new_offset, offset_difference;
      if (offset_initial == null) {
        offset_initial = false;
      }
      _this = this;
      if (offset_difference) {
        offset_difference = offset_initial - active.offset().left;
        new_offset = _this.dot_nav_offset + offset_difference + "px";
        _this.dot_nav.attr('data-transition', 'false');
        return _this.dot_nav.css('transform', "translateX(" + new_offset + ")");
      } else {
        _this.dot_nav_offset = (_this.root.width() - _this.dot_nav.width()) / 2;
        return _this.dot_nav.css('transform', "translateX(" + _this.dot_nav_offset + "px)");
      }
    };

    FrameworkCarousel.prototype.dotNavListeners = function() {
      var _this;
      _this = this;
      _this.dots.off("click." + _this.section_id + " keydown." + _this.section_id);
      return _this.dots.on("click." + _this.section_id + " keydown." + _this.section_id, function() {
        if (event.type === 'keydown' && event.key !== 'Enter') {
          return;
        }
        _this.active_slide = el(this).index() + 1;
        _this.updateActive();
        _this.goToActiveSlide(true);
        _this.setSliderHeight();
        return _this.updateActiveDot();
      });
    };

    FrameworkCarousel.prototype.arrowNavListeners = function() {
      var _this;
      _this = this;
      _this.prev.on('click keydown', function(event) {
        if (event.type === 'keydown' && event.key !== 'Enter') {
          return;
        }
        _this.slideToPrev();
        _this.setSliderHeight();
        return _this.updateActiveDot();
      });
      return _this.next.on('click keydown', function(event) {
        if (event.type === 'keydown' && event.key !== 'Enter') {
          return;
        }
        _this.slideToNext();
        _this.setSliderHeight();
        return _this.updateActiveDot();
      });
    };

    FrameworkCarousel.prototype.resizeListener = function() {
      var _this;
      _this = this;
      _this.window_width = document.documentElement.clientWidth;
      return theme.window.on("resize." + _this.section_id, theme.utils.debounce(100, function() {
        _this.window_width = document.documentElement.clientWidth;
        _this.initNewScreenSize();
        _this.updateActive();
        _this.setSliderHeight();
        _this.alignDots();
        if (theme.utils.mqs.current_window === 'small') {
          return _this.dots.attr('tabindex', '0');
        } else {
          return _this.dots.removeAttr('tabindex');
        }
      }));
    };

    FrameworkCarousel.prototype.reenableClickAfterSwiping = function() {
      var _this;
      _this = this;
      return _this.links.off("click." + _this.section_id);
    };

    FrameworkCarousel.prototype.preventClickWhenSwiping = function() {
      var _this;
      _this = this;
      return _this.links.on("click." + _this.section_id, function(event) {
        return event.preventDefault();
      });
    };

    FrameworkCarousel.prototype.autoSlide = function() {
      var _this;
      _this = this;
      return _this.auto_slide_timer = setInterval(function() {
        _this.slideToNext(true);
        _this.updateActiveDot();
        return _this.setSliderHeight();
      }, _this.rotate_frequency * 1000);
    };

    FrameworkCarousel.prototype.stopAutoSlideWhenInteracting = function() {
      var _this;
      _this = this;
      _this.root.on('click touchstart', function() {
        _this.autoplay_focus_enabled = true;
        clearInterval(_this.auto_slide_timer);
        return _this.root.off('click touchstart');
      }, true);
      return _this.focusable_el.on('focus', function() {
        _this.autoplay_focus_enabled = true;
        clearInterval(_this.auto_slide_timer);
        return _this.focusable_el.off('focus');
      }, true);
    };

    FrameworkCarousel.prototype.fadeSlides = function() {
      var _this;
      _this = this;
      if (_this.active_blocks === null || _this.old_active_blocks === null) {
        return;
      }
      _this.blocks.attr('data-active', '');
      _this.blocks.attr('data-loaded', 'false');
      _this.blocks.attr('data-loaded--mobile', 'false');
      _this.old_active_blocks.each(function(active_block) {
        el(active_block).attr('data-active', 'old');
        return el(active_block).css('left', '0%');
      });
      return _this.active_blocks.each(function(active_block, index) {
        var left;
        left = 100 / _this.total_blocks * index + "%";
        el(active_block).attr('data-active', 'new');
        return el(active_block).css('left', left);
      });
    };

    FrameworkCarousel.prototype.updateThenGoToActiveSlide = function(slide_num) {
      var _this;
      _this = this;
      _this.active_slide = slide_num;
      _this.goToActiveSlide();
      _this.setSliderHeight();
      return _this.updateActiveDot();
    };

    return FrameworkCarousel;

  })();

  theme.classes.FrameworkCart = (function() {
    function FrameworkCart(root) {
      var _this;
      this.root = root;
      this.renderDynamicCheckoutButtons = bind(this.renderDynamicCheckoutButtons, this);
      this.updateTotals = bind(this.updateTotals, this);
      this.updateAllHasItems = bind(this.updateAllHasItems, this);
      this.addItem = bind(this.addItem, this);
      this.swapInImages = bind(this.swapInImages, this);
      this.getHtml = bind(this.getHtml, this);
      this.updateHtml = bind(this.updateHtml, this);
      this.htmlListener = bind(this.htmlListener, this);
      this.updateAllHtml = bind(this.updateAllHtml, this);
      this.updateNote = bind(this.updateNote, this);
      this.noteTypingListener = bind(this.noteTypingListener, this);
      this.updateQuantity = bind(this.updateQuantity, this);
      this.clearRequests = bind(this.clearRequests, this);
      this.toggleLoadingDisplay = bind(this.toggleLoadingDisplay, this);
      this.toggleLoadingOnSubmit = bind(this.toggleLoadingOnSubmit, this);
      this.appendErrorMessage = bind(this.appendErrorMessage, this);
      this.removeItem = bind(this.removeItem, this);
      this.removeButtonListener = bind(this.removeButtonListener, this);
      this.minusButtonListener = bind(this.minusButtonListener, this);
      this.plusButtonListener = bind(this.plusButtonListener, this);
      this.inputBoxListener = bind(this.inputBoxListener, this);
      this.eventListeners = bind(this.eventListeners, this);
      this.getOtherCarts = bind(this.getOtherCarts, this);
      _this = this;
      _this.is_drawer = _this.root.data('is-drawer');
      _this.other_carts = _this.getOtherCarts();
      _this.quantity_request = {};
      _this.quantity_timer = {};
      _this.total_item_count = el('.cart--external--total-items');
      _this.total_price = el('.cart--external--total-price');
      _this.view = _this.root.attr('data-view');
      _this.updateTotals();
      _this.htmlListener();
      _this.eventListeners();
      _this.renderDynamicCheckoutButtons();
    }

    FrameworkCart.prototype.getOtherCarts = function() {
      var _this, other_carts;
      _this = this;
      return other_carts = el('[data-js-class="Cart"]').not(_this.root);
    };

    FrameworkCart.prototype.eventListeners = function() {
      var _this;
      _this = this;
      _this.inputBoxListener();
      _this.plusButtonListener();
      _this.minusButtonListener();
      _this.removeButtonListener();
      _this.toggleLoadingOnSubmit();
      return _this.noteTypingListener();
    };

    FrameworkCart.prototype.inputBoxListener = function() {
      var _this, input_box;
      _this = this;
      input_box = _this.root.find('.cart--quantity--input');
      input_box.on('keydown', function(event) {
        if ((event.which < 48 || event.which > 57) && event.which !== 8 && event.which !== 37 && event.which !== 39 && event.which !== 9) {
          return event.preventDefault();
        }
      });
      return input_box.on('focusout', function(event) {
        var line_num, quantity;
        line_num = el(this).closest('.cart--item').data('line-num');
        _this.toggleLoadingDisplay(line_num);
        _this.clearRequests(line_num);
        quantity = isNaN(parseInt(el(this).val())) ? 1 : parseInt(el(this).val());
        if (quantity === 0) {
          return _this.removeItem(line_num);
        } else {
          return _this.updateQuantity(line_num, quantity, 0, function(success, error) {
            if (success) {
              return _this.updateAllHtml(function() {});
            } else {
              return _this.updateAllHtml(function() {
                return _this.appendErrorMessage(line_num, error);
              });
            }
          });
        }
      });
    };

    FrameworkCart.prototype.plusButtonListener = function() {
      var _this, plus_button;
      _this = this;
      plus_button = _this.root.find('.cart--item--quantity .plus');
      return plus_button.on('click', function(event) {
        var input, line_num, quantity;
        event.preventDefault();
        input = el(this).prev('input');
        line_num = el(this).closest('.cart--item').data('line-num');
        quantity = isNaN(parseInt(input.val())) ? 1 : parseInt(input.val()) + 1;
        input.val(quantity);
        _this.toggleLoadingDisplay(line_num);
        _this.clearRequests(line_num);
        _this.updateQuantity(line_num, quantity, 700, function(success, error) {
          if (success) {
            return _this.updateAllHtml(function() {});
          } else {
            return _this.updateAllHtml(function() {
              return _this.appendErrorMessage(line_num, error);
            });
          }
        });
        event.preventDefault();
        return event.stopPropagation();
      });
    };

    FrameworkCart.prototype.minusButtonListener = function() {
      var _this, minus_button;
      _this = this;
      minus_button = _this.root.find('.cart--item--quantity .minus');
      return minus_button.on('click', function(event) {
        var input, line_num, quantity;
        event.preventDefault();
        input = el(this).siblings('input');
        line_num = el(this).closest('.cart--item').data('line-num');
        quantity = isNaN(parseInt(input.val())) ? 1 : parseInt(input.val()) - 1;
        if (quantity < 1) {
          quantity = 1;
        }
        input.val(quantity);
        _this.toggleLoadingDisplay(line_num);
        _this.clearRequests(line_num);
        _this.updateQuantity(line_num, quantity, 700, function(success) {
          if (success) {
            return _this.updateAllHtml(function() {});
          }
        });
        event.preventDefault();
        return event.stopPropagation();
      });
    };

    FrameworkCart.prototype.removeButtonListener = function() {
      var _this, remove_button;
      _this = this;
      remove_button = _this.root.find('.cart--item--remove');
      return remove_button.on('click', function(event) {
        var line_num;
        event.preventDefault();
        line_num = el(this).closest('.cart--item').data('line-num');
        _this.toggleLoadingDisplay(line_num);
        _this.clearRequests(line_num);
        _this.removeItem(line_num);
        event.preventDefault();
        return event.stopPropagation();
      });
    };

    FrameworkCart.prototype.removeItem = function(line_num) {
      var _this;
      _this = this;
      return _this.updateQuantity(line_num, 0, 0, function(success) {
        if (success) {
          return _this.updateAllHtml(function() {});
        }
      });
    };

    FrameworkCart.prototype.appendErrorMessage = function(line_num, error) {
      var _this, cart_error_el, cart_item;
      _this = this;
      cart_item = _this.root.find(".cart--item[data-line-num='" + line_num + "']");
      cart_error_el = theme.utils.parseHtml("<div class='cart--error' data-item='small-text'> " + error + " </div>", '.cart--error');
      return cart_item.find('.cart--item--title').append(cart_error_el);
    };

    FrameworkCart.prototype.toggleLoadingOnSubmit = function() {
      var _this;
      _this = this;
      _this.checkout_button = _this.root.find('.cart--checkout-button button');
      return _this.checkout_button.on('click', function() {
        return el(this).attr('data-loading', true);
      });
    };

    FrameworkCart.prototype.toggleLoadingDisplay = function(line_num) {
      var _this, input;
      _this = this;
      input = _this.root.find(".cart--item[data-line-num='" + line_num + "'] input");
      input.attr('data-loading', 'true');
      _this.checkout_button.attr('disabled', true);
      return _this.root.find('.cart--additional-buttons').css('visibility', 'hidden');
    };

    FrameworkCart.prototype.clearRequests = function(line_num) {
      var _this;
      _this = this;
      if (_this.quantity_request.line_num) {
        _this.quantity_request.line_num.abort();
      }
      if (_this.quantity_timer.line_num) {
        return clearTimeout(_this.quantity_timer.line_num);
      }
    };

    FrameworkCart.prototype.updateQuantity = function(line_num, requested_quantity, time_out, callback) {
      var _this, ajaxQuantity;
      _this = this;
      _this.root.find('.cart--error').remove();
      ajaxQuantity = function() {
        var request;
        request = new XMLHttpRequest();
        request.onload = function() {
          var available_quantity;
          if (request.status >= 200 && request.status < 300) {
            if (requested_quantity === 0) {
              callback(true);
              _this.updateTotals();
              return;
            }
            available_quantity = JSON.parse(request.response).items[line_num - 1].quantity;
            if (available_quantity === null || available_quantity >= requested_quantity) {
              callback(true);
              return _this.updateTotals();
            } else {
              return callback(false, theme.translations.all_items_added);
            }
          }
        };
        request.onerror = function() {
          console.log(request.statusText + ": quantity update request failed!");
          return callback(false);
        };
        request.open("POST", theme.urls.cart_change + ".js");
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify({
          line: line_num,
          quantity: requested_quantity
        }));
        return _this.quantity_request.line_num = request;
      };
      return _this.quantity_timer.line_num = setTimeout(ajaxQuantity, time_out);
    };

    FrameworkCart.prototype.noteTypingListener = function() {
      var _this, note_textbox;
      _this = this;
      note_textbox = _this.root.find('.cart--notes--textarea');
      return note_textbox.on('input', function() {
        if (_this.note_request) {
          _this.note_request.abort();
        }
        if (_this.note_timer) {
          clearTimeout(_this.note_timer);
        }
        return _this.updateNote(el(this).val());
      });
    };

    FrameworkCart.prototype.updateNote = function(note) {
      var _this, ajaxNote;
      _this = this;
      ajaxNote = function() {
        var request;
        request = new XMLHttpRequest();
        request.onload = function() {
          if (request.status >= 200 && request.status < 300) {
            return _this.other_carts.trigger('update-html');
          }
        };
        request.onerror = function() {
          return console.log(request.statusText + ": cart note update request failed!");
        };
        request.open("POST", theme.urls.cart + "/update.js");
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify({
          note: note
        }));
        return _this.note_request = request;
      };
      return _this.note_timer = setTimeout(ajaxNote, 350);
    };

    FrameworkCart.prototype.updateAllHtml = function(update_all_html_done) {
      var _this;
      _this = this;
      _this.updateHtml(update_all_html_done);
      return _this.other_carts.trigger('update-html');
    };

    FrameworkCart.prototype.htmlListener = function() {
      var _this;
      _this = this;
      return _this.root.on('update-html', function() {
        return _this.updateHtml(function() {});
      });
    };

    FrameworkCart.prototype.updateHtml = function(update_all_html_done) {
      var _this;
      _this = this;
      return _this.getHtml(_this.view, function(new_html) {
        var cart_updated_event, new_form, old_form;
        old_form = _this.root.find('.cart--form');
        new_form = new_html.find('.cart--form');
        new_form = _this.swapInImages(old_form, new_form);
        old_form.replaceWith(new_form);
        _this.eventListeners();
        update_all_html_done();
        if (_this.is_drawer) {
          theme.partials.OffCanvas.unload();
          theme.partials.OffCanvas.load();
        }
        cart_updated_event = new Event('theme:cart:updated');
        return window.dispatchEvent(cart_updated_event);
      });
    };

    FrameworkCart.prototype.getHtml = function(view, callback) {
      var _this, request, url;
      _this = this;
      url = theme.urls.cart + "?view=ajax--desktop";
      if (view === 'mobile' && _this.is_drawer) {
        url = theme.urls.cart + "?view=ajax--drawer";
      } else if (view === 'mobile') {
        url = theme.urls.cart + "?view=ajax--mobile";
      }
      request = new XMLHttpRequest();
      request.onload = function() {
        var cart_html;
        if (request.status >= 200 && request.status < 300) {
          cart_html = theme.utils.parseHtml(request.response, '.cart--root');
          callback(cart_html);
        }
      };
      request.onerror = function() {
        console.log(request.statusText + ": cart HTML update request failed!");
        callback(false);
      };
      request.open("GET", url);
      return request.send();
    };

    FrameworkCart.prototype.swapInImages = function(old_html, new_html) {
      var _this, new_items;
      _this = this;
      new_items = new_html.find('.cart--item');
      new_items.each(function(new_item) {
        var new_image, new_instance, old_image, old_item, variant_id;
        variant_id = el(new_item).attr('data-variant-id');
        new_image = el(new_item).find('.cart--item--image');
        new_instance = new_html.find("[data-variant-id='" + variant_id + "'] .cart--item--image").index(new_image);
        old_item = old_html.find("[data-variant-id='" + variant_id + "']").eq(new_instance);
        if (old_item.el.length) {
          old_image = old_item.find('.cart--item--image');
          return new_image.replaceWith(old_image);
        }
      });
      return new_html;
    };

    FrameworkCart.prototype.addItem = function(form, callback) {
      var _this, form_data, form_query_string, request;
      _this = this;
      request = new XMLHttpRequest();
      request.onload = function() {
        var available_quantity, requested_quantity;
        if (request.status >= 200 && request.status < 300) {
          available_quantity = form.find('option[selected]').data('inventory-quantity');
          requested_quantity = JSON.parse(request.response).quantity;
          if (available_quantity === null || available_quantity >= requested_quantity) {
            callback(true);
            _this.updateAllHasItems(1, true);
            return _this.updateTotals();
          } else {
            return callback(false, theme.translations.all_items_added);
          }
        }
      };
      request.onerror = function() {
        console.log(request.statusText + ": cart add item request failed!");
        return callback(false, request.statusText);
      };
      request.open("POST", theme.urls.cart_add + ".js");
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      form_data = new FormData(form.el[0]);
      form_query_string = new URLSearchParams(form_data).toString();
      return request.send(form_query_string);
    };

    FrameworkCart.prototype.updateAllHasItems = function(item_count, force_true) {
      var _this, has_items;
      if (force_true == null) {
        force_true = false;
      }
      _this = this;
      has_items = false;
      if (item_count > 0 || force_true) {
        has_items = true;
      }
      _this.root.attr('data-has-items', has_items);
      return _this.other_carts.attr('data-has-items', has_items);
    };

    FrameworkCart.prototype.updateTotals = function() {
      var _this, request;
      _this = this;
      request = new XMLHttpRequest();
      request.onload = function() {
        var count, data, total_price;
        if (request.status >= 200 && request.status < 300) {
          data = JSON.parse(request.response);
          total_price = theme.utils.formatMoney(data.total_price);
          count = data.item_count;
          _this.updateAllHasItems(count);
          _this.total_price.html(total_price);
          _this.total_item_count.text(count);
          return _this.updateTotalsComplete(count);
        }
      };
      request.onerror = function() {
        return console.log(request.statusText + ": error updating cart totals!");
      };
      request.open("GET", theme.urls.cart + ".js");
      return request.send();
    };

    FrameworkCart.prototype.renderDynamicCheckoutButtons = function() {
      var _this;
      _this = this;
      if (window.location.pathname === theme.urls.cart) {
        el('.off-canvas--right-sidebar .cart--additional-buttons').remove();
        if (theme.utils.mqs.current_window === 'small') {
          return el('[data-view="desktop"] .cart--additional-buttons').remove();
        }
      }
    };

    return FrameworkCart;

  })();

  theme.classes.FrameworkCollection = (function() {
    function FrameworkCollection(root) {
      var _this;
      this.root = root;
      this.clearTagFilter = bind(this.clearTagFilter, this);
      this.clearSortByFilter = bind(this.clearSortByFilter, this);
      this.clearActiveOptionsListener = bind(this.clearActiveOptionsListener, this);
      this.activeSortByListener = bind(this.activeSortByListener, this);
      this.activeTagListeners = bind(this.activeTagListeners, this);
      this.formatProducts = bind(this.formatProducts, this);
      this.renderGridHtml = bind(this.renderGridHtml, this);
      this.getGridHtml = bind(this.getGridHtml, this);
      this.toggleActiveOptionContainer = bind(this.toggleActiveOptionContainer, this);
      this.getAjaxUrl = bind(this.getAjaxUrl, this);
      this.renderActiveTags = bind(this.renderActiveTags, this);
      this.renderActiveSortBy = bind(this.renderActiveSortBy, this);
      this.showLoadingView = bind(this.showLoadingView, this);
      this.checkActiveOptions = bind(this.checkActiveOptions, this);
      this.refineLinkListener = bind(this.refineLinkListener, this);
      this.sortByLinkListener = bind(this.sortByLinkListener, this);
      this.collectionListListener = bind(this.collectionListListener, this);
      this.resetListener = bind(this.resetListener, this);
      this.menuToggleListeners = bind(this.menuToggleListeners, this);
      this.moveFilterOffCanvas = bind(this.moveFilterOffCanvas, this);
      this.matchImageHeights = bind(this.matchImageHeights, this);
      this.layoutListener = bind(this.layoutListener, this);
      this.setLayout = bind(this.setLayout, this);
      this.initLayout = bind(this.initLayout, this);
      this.hoverImagesLoaded = bind(this.hoverImagesLoaded, this);
      this.resizeListeners = bind(this.resizeListeners, this);
      this.sectionListeners = bind(this.sectionListeners, this);
      this.initFilter = bind(this.initFilter, this);
      this.initNavigation = bind(this.initNavigation, this);
      this.initGrid = bind(this.initGrid, this);
      this.load = bind(this.load, this);
      _this = this;
      _this.load();
    }

    FrameworkCollection.prototype.load = function() {
      var _this;
      _this = this;
      _this.initGrid();
      _this.initNavigation();
      _this.initFilter();
      _this.sectionListeners();
      return _this.resizeListeners();
    };

    FrameworkCollection.prototype.initGrid = function() {
      var _this;
      _this = this;
      _this.body = _this.root.find('.collection--body--root');
      _this.grid_container = _this.body.find('.collection--body--grid');
      _this.max_columns = _this.body.data('max-columns');
      _this.num_columns = _this.grid_container.data('columns');
      _this.pagination_link = _this.body.find('[href="#collection-pagination"]');
      _this.spinner = _this.body.find('.collection--body--spinner');
      _this.pagination = _this.body.find('.collection--body--pagination');
      _this.url = _this.body.attr('data-url');
      if (theme.settings.hover_image_enabled) {
        return _this.hoverImagesLoaded();
      }
    };

    FrameworkCollection.prototype.initNavigation = function() {
      var _this;
      _this = this;
      _this.navigation = _this.root.find('.collection--navigation--root');
      _this.active_options_container = _this.navigation.find('.collection--navigation--options-container');
      _this.active_sort_by_container = _this.navigation.find('.collection--navigation--active-sort-by');
      _this.active_tags_wrapper = _this.navigation.find('.collection--navigation--active-options');
      _this.clear_tags_button = _this.navigation.find('.collection--navigation--options-clear');
      _this.layout_buttons = _this.navigation.find('.collection--navigation--layout > *');
      _this.small_layout_button = _this.navigation.find('.collection--navigation--layout-small');
      _this.tag_template = _this.navigation.find('.collection--navigation--active-tag');
      _this.tag_template_html = _this.tag_template.outerHtml();
      if (_this.layout_buttons.length && _this.max_columns > 2) {
        _this.initLayout();
        _this.setLayout();
        return _this.layoutListener();
      } else {
        _this.layout_buttons.hide();
        return _this.matchImageHeights();
      }
    };

    FrameworkCollection.prototype.initFilter = function() {
      var _this;
      _this = this;
      _this.filter = _this.root.find('.collection--filter--root');
      if (!_this.filter.length) {
        return;
      }
      _this.browse_links = _this.filter.find('.collection--filter--browse-link');
      _this.menu_toggles = _this.filter.find('[aria-expanded]');
      _this.refine_links = _this.filter.find('.collection--filter--refine-link');
      _this.sort_by_links = _this.filter.find('.collection--filter--sort-by-link');
      _this.reset_button = _this.filter.find('.collection--filter--reset');
      _this.moveFilterOffCanvas();
      _this.menuToggleListeners();
      _this.resetListener();
      if (_this.browse_links.length) {
        _this.collectionListListener();
      }
      if (_this.sort_by_links.length) {
        _this.sortByLinkListener();
      }
      if (_this.refine_links.length) {
        _this.refineLinkListener();
      }
      if (_this.sort_by_links.length || _this.refine_links.length) {
        _this.checkActiveOptions();
        _this.activeSortByListener();
        return _this.clearActiveOptionsListener();
      }
    };

    FrameworkCollection.prototype.sectionListeners = function() {
      var _this;
      _this = this;
      return _this.root.on('shopify:section:load', function() {
        theme.partials.OffCanvas.unload();
        theme.partials.OffCanvas.load();
        _this.initGrid();
        _this.initNavigation();
        _this.initFilter();
        return theme.partials.FrameworkSearch.searchLinks();
      });
    };

    FrameworkCollection.prototype.resizeListeners = function() {
      var _this;
      _this = this;
      return theme.window.on('resize.Collection', theme.utils.debounce(100, function() {
        return _this.matchImageHeights();
      }));
    };

    FrameworkCollection.prototype.hoverImagesLoaded = function() {
      var _this;
      _this = this;
      return _this.body.find('.product--hover-image').each(function(image) {
        var hover_image;
        hover_image = el(image);
        return theme.utils.imagesLoaded(hover_image, function() {
          var product;
          product = hover_image.closest('[data-hover-image="true"]');
          return product.attr('data-hover-image', 'loaded');
        });
      });
    };

    FrameworkCollection.prototype.initLayout = function() {
      var _this;
      _this = this;
      _this.layout_buttons.removeAttr('style');
      return _this.small_layout_button.attr('data-column-size', _this.max_columns);
    };

    FrameworkCollection.prototype.setLayout = function() {
      var _this, columns;
      _this = this;
      columns = parseInt(localStorage.getItem(theme.local_storage.collection_view));
      if (!(columns && (columns === 2 || columns === _this.num_columns))) {
        columns = _this.num_columns;
        localStorage.setItem(theme.local_storage.collection_view, columns);
      }
      _this.grid_container.attr('data-columns', columns);
      _this.layout_buttons.attr('data-active', false);
      _this.layout_buttons.filter("[data-column-size='" + columns + "']").attr('data-active', true);
      return _this.matchImageHeights();
    };

    FrameworkCollection.prototype.layoutListener = function() {
      var _this;
      _this = this;
      _this.layout_buttons.off('click keydown');
      return _this.layout_buttons.on('click keydown', function(event) {
        if (event.type === 'keydown' && event.key !== 'Enter') {
          return;
        }
        localStorage.setItem(theme.local_storage.collection_view, el(this).data('column-size'));
        return _this.setLayout();
      });
    };

    FrameworkCollection.prototype.matchImageHeights = function() {
      var _this;
      _this = this;
      return theme.utils.matchImageHeights(_this.grid_container, _this.body.find('.product--root'), '.product--image-wrapper', _this.body.find('.featured-content--root'));
    };

    FrameworkCollection.prototype.moveFilterOffCanvas = function() {
      var _this;
      _this = this;
      return el('[data-view="collection-filter"]').empty().append(_this.filter);
    };

    FrameworkCollection.prototype.menuToggleListeners = function() {
      var _this;
      _this = this;
      return _this.menu_toggles.on('click keydown', function(event) {
        var aria_expanded, other_toggles, selected_menu;
        if (event.type === 'keydown' && event.key !== 'Enter') {
          return;
        }
        other_toggles = _this.menu_toggles.not(el(this));
        other_toggles.attr('aria-expanded', false);
        other_toggles.siblings('[class*="menu"]').attr('data-transition', 'fade-out');
        aria_expanded = el(this).attr('aria-expanded') !== 'true';
        el(this).attr('aria-expanded', aria_expanded);
        selected_menu = el(this).siblings('[class*="menu"]');
        if (aria_expanded) {
          return setTimeout(function() {
            return selected_menu.attr('data-transition', 'fade-in');
          }, 0);
        } else {
          return selected_menu.attr('data-transition', 'fade-out');
        }
      });
    };

    FrameworkCollection.prototype.resetListener = function() {
      var _this;
      _this = this;
      return _this.reset_button.on('click keydown', function(event) {
        if (event.type === 'keydown' && event.key !== 'Enter') {
          return;
        }
        _this.clearSortByFilter();
        if (_this.current_active_tags) {
          return _this.current_active_tags.each(function(tag) {
            return _this.clearTagFilter(el(tag).attr('data-handle'));
          });
        }
      });
    };

    FrameworkCollection.prototype.collectionListListener = function() {
      var _this;
      _this = this;
      return _this.browse_links.on('click keydown', function(event) {
        var location_pathname, was_active;
        if (event.type === 'keydown' && event.key !== 'Enter') {
          return;
        }
        was_active = el(this).attr('data-active') === 'true';
        _this.browse_links.attr('data-active', false);
        if (was_active) {
          location_pathname = theme.urls.all_products_collection;
        } else {
          location_pathname = el(this).data('value');
          el(this).attr('data-active', true);
        }
        location.href = "" + location.origin + location_pathname;
        return setTimeout(function() {
          return theme.partials.OffCanvas.closeRight();
        }, 300);
      });
    };

    FrameworkCollection.prototype.sortByLinkListener = function() {
      var _this;
      _this = this;
      return _this.sort_by_links.on('click keydown', function(event) {
        var sort_by_was_active;
        if (event.type === 'keydown' && event.key !== 'Enter') {
          return;
        }
        _this.showLoadingView();
        sort_by_was_active = el(this).attr('data-active') === 'true';
        _this.sort_by_links.attr('data-active', false);
        el(this).attr('data-active', !sort_by_was_active);
        if (!sort_by_was_active) {
          _this.renderActiveSortBy(el(this));
        } else {
          _this.sort_by_param = '';
          _this.active_sort_by_container.hide();
        }
        return _this.getAjaxUrl();
      });
    };

    FrameworkCollection.prototype.refineLinkListener = function() {
      var _this;
      _this = this;
      return _this.refine_links.on('click keydown', function(event) {
        var filter_was_active;
        if (event.type === 'keydown' && event.key !== 'Enter') {
          return;
        }
        _this.showLoadingView();
        _this.active_tags_wrapper.find('.collection--navigation--active-tag').remove();
        filter_was_active = el(this).attr('data-active') === 'true';
        el(this).attr('data-active', !filter_was_active);
        _this.renderActiveTags();
        return _this.getAjaxUrl();
      });
    };

    FrameworkCollection.prototype.checkActiveOptions = function() {
      var _this, active_sort_link;
      _this = this;
      _this.tag_template.hide();
      active_sort_link = _this.sort_by_links.filter('[data-active="true"]');
      if (active_sort_link.length) {
        _this.renderActiveSortBy(active_sort_link);
      } else {
        _this.sort_by_param = '';
      }
      _this.renderActiveTags();
      return _this.toggleActiveOptionContainer();
    };

    FrameworkCollection.prototype.showLoadingView = function() {
      var _this;
      _this = this;
      _this.grid_container.empty();
      _this.grid_container.hide();
      _this.pagination.hide();
      return _this.spinner.css('display', 'flex');
    };

    FrameworkCollection.prototype.renderActiveSortBy = function(active_sort_link) {
      var _this;
      _this = this;
      _this.sort_by_param = "?sort_by=" + (active_sort_link.attr('data-value'));
      _this.active_sort_by_container.find('span').text(active_sort_link.data('name'));
      _this.active_sort_by_container.attr('data-value', active_sort_link.attr('data-value'));
      return _this.active_sort_by_container.show();
    };

    FrameworkCollection.prototype.renderActiveTags = function() {
      var _this, index, tag_el, tag_html;
      _this = this;
      _this.active_tag_names = [];
      _this.active_tag_handles = [];
      _this.refine_links.filter('[data-active="true"]').each(function(link) {
        _this.active_tag_names.push(el(link).text().trim());
        return _this.active_tag_handles.push(el(link).attr('data-handle'));
      });
      if (_this.active_tag_names.length > 0) {
        index = 0;
        while (index < _this.active_tag_names.length) {
          tag_html = _this.tag_template_html.replace('<span></span>', _this.active_tag_names[index]).replace('data-handle="template"', "data-handle='" + _this.active_tag_handles[index] + "'");
          tag_el = theme.utils.parseHtml(tag_html, '.collection--navigation--active-tag');
          _this.active_tags_wrapper.prepend(tag_el);
          index++;
        }
        return _this.activeTagListeners();
      }
    };

    FrameworkCollection.prototype.getAjaxUrl = function() {
      var _this;
      _this = this;
      _this.ajax_url = _this.url + "/" + (_this.active_tag_handles.join('+')) + _this.sort_by_param;
      history.replaceState({}, '', _this.ajax_url);
      _this.getGridHtml();
      return _this.toggleActiveOptionContainer();
    };

    FrameworkCollection.prototype.toggleActiveOptionContainer = function() {
      var _this;
      _this = this;
      if (_this.active_tag_names.length > 0 || _this.sort_by_param !== '') {
        return _this.active_options_container.show();
      } else {
        return _this.active_options_container.hide();
      }
    };

    FrameworkCollection.prototype.getGridHtml = function() {
      var _this;
      _this = this;
      if (_this.request) {
        _this.request.abort();
      }
      _this.request = new XMLHttpRequest();
      _this.request.onload = function() {
        var collection_body_ajax;
        if (_this.request.status >= 200 && _this.request.status < 300) {
          collection_body_ajax = theme.utils.parseHtml(_this.request.response, '.collection--body--root');
          _this.renderGridHtml(collection_body_ajax);
          _this.spinner.hide();
          _this.grid_container.css('display', 'grid');
          if (collection_body_ajax.find('.product--root').length > 0) {
            return _this.formatProducts();
          }
        }
      };
      _this.request.onerror = function() {
        return console.log(_this.request.statusText + ": collection filter request failed!");
      };
      _this.request.open("GET", _this.ajax_url);
      return _this.request.send();
    };

    FrameworkCollection.prototype.renderGridHtml = function(collection_body_ajax) {
      var _this, collection_grid_html, pagination_root;
      _this = this;
      collection_grid_html = collection_body_ajax.find('.collection--body--grid').html();
      _this.grid_container.html(collection_grid_html);
      pagination_root = collection_body_ajax.find('.collection--body--pagination');
      if (pagination_root.html()) {
        _this.pagination.html(pagination_root.html());
        _this.pagination.removeAttr('style');
        return _this.pagination_link.show();
      } else {
        return _this.pagination_link.hide();
      }
    };

    FrameworkCollection.prototype.formatProducts = function() {
      var _this;
      _this = this;
      _this.matchImageHeights();
      theme.utils.loadJsClasses(_this.grid_container);
      if (theme.settings.hover_image_enabled) {
        _this.hoverImagesLoaded();
      }
      if (theme.settings.quick_add) {
        theme.partials.OffCanvas.unload();
        return theme.partials.OffCanvas.load();
      }
    };

    FrameworkCollection.prototype.activeTagListeners = function() {
      var _this;
      _this = this;
      _this.current_active_tags = _this.active_tags_wrapper.find('.collection--navigation--active-tag');
      _this.clearActiveOptionsListener();
      return _this.current_active_tags.on('click keydown', function(event) {
        if (event.type === 'keydown' && event.key !== 'Enter') {
          return;
        }
        return _this.clearTagFilter(el(this).attr('data-handle'));
      });
    };

    FrameworkCollection.prototype.activeSortByListener = function() {
      var _this;
      _this = this;
      return _this.active_sort_by_container.on('click keydown', function(event) {
        if (event.type === 'keydown' && event.key !== 'Enter') {
          return;
        }
        return _this.clearSortByFilter();
      });
    };

    FrameworkCollection.prototype.clearActiveOptionsListener = function() {
      var _this;
      _this = this;
      _this.clear_tags_button.off('click keydown');
      return _this.clear_tags_button.on('click keydown', function(event) {
        if (event.type === 'keydown' && event.key !== 'Enter') {
          return;
        }
        _this.clearSortByFilter();
        if (_this.current_active_tags) {
          return _this.current_active_tags.each(function(tag) {
            return _this.clearTagFilter(el(tag).attr('data-handle'));
          });
        }
      });
    };

    FrameworkCollection.prototype.clearSortByFilter = function() {
      var _this, active_sort_by_link;
      _this = this;
      active_sort_by_link = _this.sort_by_links.filter("[data-active='true']");
      return active_sort_by_link.trigger('click');
    };

    FrameworkCollection.prototype.clearTagFilter = function(handle) {
      var _this, active_refine_links;
      _this = this;
      active_refine_links = _this.refine_links.filter("[data-handle='" + handle + "'][data-active='true']");
      return active_refine_links.trigger('click');
    };

    FrameworkCollection.toggleFilterMenu = function(filter_button) {
      var _this, filter, menu_name;
      _this = FrameworkCollection;
      menu_name = filter_button.data('toggle-menu');
      filter = el(".collection--filter--root");
      return filter.find("[aria-controls='" + menu_name + "'][aria-expanded='false']").trigger('click');
    };

    return FrameworkCollection;

  })();

  theme.classes.FrameworkContentBlocks = (function() {
    function FrameworkContentBlocks(root) {
      var _this;
      this.root = root;
      _this = this;
    }

    return FrameworkContentBlocks;

  })();

  theme.classes.FrameworkDisclosure = (function() {
    function FrameworkDisclosure(root) {
      var _this;
      this.root = root;
      this.optionChangeCallback = bind(this.optionChangeCallback, this);
      this.updateFormPosition = bind(this.updateFormPosition, this);
      this.toggleFormDisplay = bind(this.toggleFormDisplay, this);
      this.setOptionOnClick = bind(this.setOptionOnClick, this);
      this.hideFormWhenFocusOut = bind(this.hideFormWhenFocusOut, this);
      this.showFormWhenClick = bind(this.showFormWhenClick, this);
      this.updateFormListeners = bind(this.updateFormListeners, this);
      this.load = bind(this.load, this);
      _this = this;
      _this.current_option = _this.root.find('.disclosure--current-option');
      _this.form = _this.root.find('.disclosure--form');
      _this.input = _this.root.find('[data-item="disclosure"]');
      _this.links = _this.root.find('.disclosure--option-link');
      _this.toggle = _this.root.find('.disclosure--toggle');
      _this.type = _this.root.attr('data-type');
      _this.toggle_and_form_gap = 8;
      _this.window_and_form_gap = 32;
      _this.form_space_needed = theme.utils.getHiddenElHeight(_this.form, false) + _this.toggle_and_form_gap + _this.window_and_form_gap;
      _this.load();
    }

    FrameworkDisclosure.prototype.load = function() {
      var _this;
      _this = this;
      _this.updateFormListeners();
      _this.showFormWhenClick();
      _this.hideFormWhenFocusOut();
      _this.setOptionOnClick();
      _this.updateFormPosition();
      if (_this.type === 'url-redirect' || _this.type === 'localization') {
        return _this.optionChangeCallback();
      }
    };

    FrameworkDisclosure.prototype.updateFormListeners = function() {
      var _this;
      _this = this;
      theme.window.on('resize.Disclosure', theme.utils.debounce(100, function() {
        return _this.updateFormPosition();
      }));
      return _this.root.on('update_form_position', function() {
        return _this.updateFormPosition();
      });
    };

    FrameworkDisclosure.prototype.showFormWhenClick = function() {
      var _this;
      _this = this;
      return _this.toggle.on('click keydown', function(event) {
        var aria_expanded;
        if (event.type === 'keydown' && event.key !== 'Enter') {
          return;
        }
        aria_expanded = el(this).attr('aria-expanded') === 'true';
        return _this.toggleFormDisplay(!aria_expanded);
      });
    };

    FrameworkDisclosure.prototype.hideFormWhenFocusOut = function() {
      var _this;
      _this = this;
      _this.toggle.on('focusout', function(event) {
        var form_has_focus;
        form_has_focus = _this.root.has(event.relatedTarget);
        if (!form_has_focus) {
          return _this.toggleFormDisplay(false);
        }
      });
      _this.form.on('focusout', function(event) {
        var child_in_focus, is_visible;
        child_in_focus = el(this).has(event.relatedTarget);
        is_visible = _this.toggle.attr('aria-expanded') === 'true';
        if (is_visible && !child_in_focus) {
          return _this.toggleFormDisplay(false);
        }
      });
      return _this.root.on('keydown', function(event) {
        if (event.key !== "Escape") {
          return;
        }
        _this.toggleFormDisplay(false);
        return _this.toggle.focus();
      });
    };

    FrameworkDisclosure.prototype.setOptionOnClick = function() {
      var _this;
      _this = this;
      return _this.links.on('click keydown', function(event) {
        var option_selected_name, option_selected_value;
        if (event.key === 'Enter') {
          _this.toggle.focus();
        } else if (event.type === 'keydown') {
          return;
        }
        option_selected_value = el(this).attr('data-value');
        option_selected_name = el(this).text();
        _this.toggleFormDisplay(false);
        _this.current_option.text(option_selected_name);
        _this.links.attr('aria-current', false);
        el(this).attr('aria-current', true);
        _this.input.val(option_selected_value);
        return _this.input.trigger('change');
      });
    };

    FrameworkDisclosure.prototype.toggleFormDisplay = function(open_form) {
      var _this;
      _this = this;
      return _this.toggle.attr('aria-expanded', open_form);
    };

    FrameworkDisclosure.prototype.updateFormPosition = function() {
      var _this, clearance_height, close_to_bottom, close_to_top, distance_from_bottom, distance_from_top, form_height, height_of_canvas, height_of_toggle, max_form_height;
      _this = this;
      height_of_toggle = _this.toggle.outerHeight();
      clearance_height = height_of_toggle + _this.toggle_and_form_gap;
      height_of_canvas = _this.root.closest('[class^=off-canvas]').height();
      distance_from_top = _this.root.offset().top;
      distance_from_bottom = height_of_canvas - distance_from_top - height_of_toggle;
      close_to_bottom = (_this.form_space_needed > distance_from_bottom) && (distance_from_bottom < distance_from_top);
      close_to_top = (_this.form_space_needed > distance_from_top) && (distance_from_bottom > distance_from_top);
      max_form_height = window.innerHeight - clearance_height - _this.window_and_form_gap;
      if (close_to_bottom) {
        max_form_height -= distance_from_bottom;
      } else if (close_to_top) {
        max_form_height -= distance_from_top;
      }
      _this.form.css('max-height', max_form_height + "px");
      if (close_to_bottom) {
        form_height = theme.utils.getHiddenElHeight(_this.form, false) + _this.toggle_and_form_gap;
        return _this.form.css('top', "-" + form_height + "px");
      } else {
        return _this.form.css('top', clearance_height + "px");
      }
    };

    FrameworkDisclosure.prototype.optionChangeCallback = function() {
      var _this;
      _this = this;
      return _this.input.on('change', function() {
        if (_this.type === 'url-redirect') {
          return window.location.href = el(this).val();
        } else if (_this.type === 'localization') {
          return el(this).closest('form').submit();
        }
      });
    };

    return FrameworkDisclosure;

  })();

  theme.classes.FrameworkDomElement = (function() {
    function FrameworkDomElement(selector1, container1) {
      var event_function_map;
      this.selector = selector1;
      this.container = container1 != null ? container1 : document;
      this.wrapInner = bind(this.wrapInner, this);
      this.wrapAll = bind(this.wrapAll, this);
      this.width = bind(this.width, this);
      this.val = bind(this.val, this);
      this.trigger = bind(this.trigger, this);
      this.text = bind(this.text, this);
      this.submit = bind(this.submit, this);
      this.siblings = bind(this.siblings, this);
      this.show = bind(this.show, this);
      this.setAttribute = bind(this.setAttribute, this);
      this.scrollTop = bind(this.scrollTop, this);
      this.replaceWith = bind(this.replaceWith, this);
      this.removeClass = bind(this.removeClass, this);
      this.removeAttr = bind(this.removeAttr, this);
      this.remove = bind(this.remove, this);
      this.prev = bind(this.prev, this);
      this.prepend = bind(this.prepend, this);
      this.parent = bind(this.parent, this);
      this.outerWidth = bind(this.outerWidth, this);
      this.outerHtml = bind(this.outerHtml, this);
      this.outerHeight = bind(this.outerHeight, this);
      this.on = bind(this.on, this);
      this.offset = bind(this.offset, this);
      this.off = bind(this.off, this);
      this.not = bind(this.not, this);
      this.next = bind(this.next, this);
      this.last = bind(this.last, this);
      this.isEmpty = bind(this.isEmpty, this);
      this.isVisible = bind(this.isVisible, this);
      this.is = bind(this.is, this);
      this.insertBefore = bind(this.insertBefore, this);
      this.index = bind(this.index, this);
      this.html = bind(this.html, this);
      this.hide = bind(this.hide, this);
      this.height = bind(this.height, this);
      this.hasClass = bind(this.hasClass, this);
      this.has = bind(this.has, this);
      this.getAttribute = bind(this.getAttribute, this);
      this.focus = bind(this.focus, this);
      this.first = bind(this.first, this);
      this.find = bind(this.find, this);
      this.filter = bind(this.filter, this);
      this.eq = bind(this.eq, this);
      this.empty = bind(this.empty, this);
      this.each = bind(this.each, this);
      this.data = bind(this.data, this);
      this.css = bind(this.css, this);
      this.closest = bind(this.closest, this);
      this.clone = bind(this.clone, this);
      this.children = bind(this.children, this);
      this.attr = bind(this.attr, this);
      this.append = bind(this.append, this);
      this.addClass = bind(this.addClass, this);
      this.add = bind(this.add, this);
      if ((typeof this.selector) === 'string') {
        this.el = this.container.querySelectorAll(this.selector);
      } else if (Array.isArray(this.selector)) {
        this.el = this.selector;
      } else if ((typeof this.selector) === 'object') {
        this.el = new Array(this.selector);
      } else {
        this.el = [];
      }
      if (this.el[0] !== null) {
        this.length = this.el.length;
      } else {
        this.length = 0;
      }
      event_function_map = [];
      this.el.forEach(function(el) {
        return event_function_map.push({});
      });
      this.event_function_map = event_function_map;
    }

    FrameworkDomElement.prototype.add = function(element) {
      var elements_to_add;
      if ((typeof element) === 'string') {
        elements_to_add = Array.from(document.querySelectorAll(element.selector));
      } else {
        elements_to_add = Array.from(element.el);
      }
      this.el.forEach(function(el) {
        return elements_to_add.push(el);
      });
      return el(elements_to_add);
    };

    FrameworkDomElement.prototype.addClass = function(class_name) {
      if (!class_name) {
        return false;
      }
      this.el.forEach(function(el) {
        return el.classList.add(class_name);
      });
      return this;
    };

    FrameworkDomElement.prototype.append = function(element) {
      if (typeof element === 'object' && this.length && element.length) {
        this.el.forEach(function(parent_el) {
          return element.el.forEach(function(child_el) {
            return parent_el.appendChild(child_el);
          });
        });
      }
      return this;
    };

    FrameworkDomElement.prototype.attr = function(attr, val) {
      if (val == null) {
        val = null;
      }
      if (!attr) {
        return;
      }
      if (val !== null && this.length) {
        this.el.forEach(function(el) {
          return el.setAttribute(attr, val);
        });
        return this;
      } else if (this.length) {
        return this.el[0].getAttribute(attr);
      }
    };

    FrameworkDomElement.prototype.children = function(selector) {
      if (!selector) {
        selector = '*';
      }
      return el(":scope > " + selector, this.el[0]);
    };

    FrameworkDomElement.prototype.clone = function() {
      if (this.length === 0) {
        return;
      }
      return el(this.el[0].cloneNode(true));
    };

    FrameworkDomElement.prototype.closest = function(selector) {
      if (!(selector && this.length)) {
        return false;
      }
      return el(this.el[0].closest(selector));
    };

    FrameworkDomElement.prototype.css = function(property_name, value) {
      if (!(property_name || value)) {
        return false;
      } else if (value === void 0 && this.length) {
        return window.getComputedStyle(this.el[0])[property_name];
      } else {
        this.el.forEach(function(el) {
          return el.style[property_name] = value;
        });
      }
      return this;
    };

    FrameworkDomElement.prototype.data = function(data_attr) {
      var attr;
      if (!(data_attr && this.length)) {
        return false;
      }
      if (!(data_attr.indexOf('-') > -1)) {
        data_attr = (data_attr.match(/[A-Za-z][a-z]*/g) || {}).join('-');
      }
      attr = this.el[0].getAttribute("data-" + data_attr);
      if (attr === 'true') {
        return true;
      } else if (attr === 'false') {
        return false;
      } else if (isNaN(parseFloat(attr))) {
        return attr;
      } else {
        return parseFloat(attr);
      }
    };

    FrameworkDomElement.prototype.each = function(callback) {
      return this.el.forEach(function(el, index) {
        return callback(el, index);
      });
    };

    FrameworkDomElement.prototype.empty = function() {
      if (this.length) {
        this.el.forEach(function(el) {
          return el.innerHTML = '';
        });
      }
      return this;
    };

    FrameworkDomElement.prototype.eq = function(index) {
      if (index === void 0) {
        return -1;
      }
      return el(this.el[index]);
    };

    FrameworkDomElement.prototype.filter = function(selector) {
      var elements_to_filter, new_element_list;
      if (!selector) {
        return false;
      }
      elements_to_filter = Array.from(this.container.querySelectorAll(selector));
      new_element_list = [];
      this.el.forEach(function(el) {
        if (elements_to_filter.includes(el)) {
          return new_element_list.push(el);
        }
      });
      return el(new_element_list);
    };

    FrameworkDomElement.prototype.find = function(selector) {
      var new_elements;
      if (!selector) {
        return false;
      } else if (selector.charAt(0) === '>') {
        selector = ":scope " + selector;
      }
      if (this.length === 1) {
        return el(selector, this.el[0]);
      } else {
        new_elements = [];
        this.el.forEach(function(el) {
          var found_element, found_elements, j, len, results1;
          found_elements = el.querySelectorAll(selector);
          results1 = [];
          for (j = 0, len = found_elements.length; j < len; j++) {
            found_element = found_elements[j];
            results1.push(new_elements.push(found_element));
          }
          return results1;
        });
        return el(new_elements);
      }
    };

    FrameworkDomElement.prototype.first = function() {
      return el(this.el[0]);
    };

    FrameworkDomElement.prototype.focus = function(index) {
      if (!index) {
        index = 0;
      }
      if (this.length) {
        this.el[index].focus();
      }
      return this;
    };

    FrameworkDomElement.prototype.getAttribute = function(attr) {
      if (!(attr && this.length)) {
        return;
      }
      return this.el[0].getAttribute(attr);
    };

    FrameworkDomElement.prototype.has = function(element) {
      if (typeof element === 'object') {
        return this.el[0].contains(element);
      } else {

      }
    };

    FrameworkDomElement.prototype.hasClass = function(class_name) {
      if (!(class_name && this.length)) {
        return;
      }
      return this.el[0].classList.contains(class_name);
    };

    FrameworkDomElement.prototype.height = function(height) {
      if (this.length === 0) {
        return;
      }
      if (!height) {
        return this.el[0].offsetHeight;
      } else {
        return this.el.forEach(function(el) {
          return el.style.height = height + "px";
        });
      }
    };

    FrameworkDomElement.prototype.hide = function() {
      if (this.length === 0) {
        return;
      }
      this.el.forEach(function(el) {
        return el.style.display = "none";
      });
      return this;
    };

    FrameworkDomElement.prototype.html = function(html) {
      if (!html) {
        return this.el[0].innerHTML;
      } else if (this.length) {
        this.el[0].innerHTML = html;
      }
      return this;
    };

    FrameworkDomElement.prototype.index = function(element) {
      var found_index;
      if (!element) {
        return Array.from(this.el[0].parentNode.children).indexOf(this.el[0]);
      } else {
        found_index = -1;
        this.el.forEach(function(el, index) {
          if (el === element.el[0]) {
            return found_index = index;
          }
        });
        return found_index;
      }
    };

    FrameworkDomElement.prototype.insertBefore = function(new_el) {
      if (this.length === 0) {
        return;
      }
      this.el.forEach(function(el) {
        return el.parentNode.insertBefore(new_el.el[0], el);
      });
      return this;
    };

    FrameworkDomElement.prototype.is = function(element) {
      var elements_to_compare;
      if (!element) {
        return false;
      } else if ((typeof element) === 'string') {
        elements_to_compare = Array.from(document.querySelectorAll(element));
      } else {
        elements_to_compare = Array.from(element.el);
      }
      return elements_to_compare.includes(this.el[0]);
    };

    FrameworkDomElement.prototype.isVisible = function() {
      var is_visible;
      if (this.length === 0) {
        return;
      }
      is_visible = false;
      this.el.forEach(function(el) {
        var style;
        style = window.getComputedStyle(el);
        if (style.display !== 'none') {
          return is_visible = true;
        }
      });
      return is_visible;
    };

    FrameworkDomElement.prototype.isEmpty = function() {
      var is_empty;
      if (this.length === 0) {
        return;
      }
      is_empty = true;
      this.el.forEach(function(el) {
        if (el.hasChildNodes()) {
          is_empty = false;
        }
      });
      return is_empty;
    };

    FrameworkDomElement.prototype.last = function() {
      if (this.length === 0) {
        return;
      }
      return el(this.el[this.el.length - 1], this.container);
    };

    FrameworkDomElement.prototype.next = function() {
      if (this.length === 0) {
        return;
      }
      return el(this.el[0].nextElementSibling);
    };

    FrameworkDomElement.prototype.not = function(element) {
      var elements_to_remove, new_object_arr;
      if ((typeof element) === 'string') {
        elements_to_remove = Array.from(document.querySelectorAll(element));
      } else {
        elements_to_remove = Array.from(element.el);
      }
      new_object_arr = [];
      this.el.forEach(function(el) {
        if (!(elements_to_remove.includes(el) || new_object_arr.includes(el))) {
          return new_object_arr.push(el);
        }
      });
      return el(new_object_arr);
    };

    FrameworkDomElement.prototype.off = function(types) {
      var event_function_map;
      if (this.length === 0) {
        return;
      }
      event_function_map = this.event_function_map;
      this.el.forEach(function(el, el_index) {
        return types.split(' ').forEach(function(type) {
          if (event_function_map[el_index][type]) {
            el.removeEventListener(type.split('.')[0], event_function_map[el_index][type]);
            return delete event_function_map[el_index][type];
          }
        });
      });
      this.event_function_map = event_function_map;
      return true;
    };

    FrameworkDomElement.prototype.offset = function() {
      var offset, rect;
      if (this.length === 0) {
        return;
      }
      rect = this.el[0].getBoundingClientRect();
      return offset = {
        top: rect.top + window.pageYOffset,
        left: rect.left + window.pageXOffset
      };
    };

    FrameworkDomElement.prototype.on = function(types, event_function, passive) {
      var event_function_map;
      if (passive == null) {
        passive = false;
      }
      if (this.length === 0) {
        return;
      }
      event_function_map = this.event_function_map;
      this.el.forEach(function(el, el_index) {
        return types.split(' ').forEach(function(type) {
          event_function_map[el_index][type] = event_function;
          return el.addEventListener(type.split('.')[0], event_function, {
            passive: passive
          });
        });
      });
      this.event_function_map = event_function_map;
      return true;
    };

    FrameworkDomElement.prototype.outerHeight = function() {
      if (this.length) {
        return this.el[0].offsetHeight;
      }
    };

    FrameworkDomElement.prototype.outerHtml = function() {
      if (this.length) {
        return this.el[0].outerHTML;
      }
    };

    FrameworkDomElement.prototype.outerWidth = function() {
      if (this.length) {
        return this.el[0].offsetWidth;
      }
    };

    FrameworkDomElement.prototype.parent = function() {
      var parent_el;
      if (this.length) {
        parent_el = [];
        this.el.forEach(function(child) {
          return parent_el.push(child.parentNode);
        });
        return el(parent_el);
      } else {
        return this;
      }
    };

    FrameworkDomElement.prototype.prepend = function(element) {
      if (typeof element === 'object' && this.length && element.length) {
        this.el.forEach(function(parent_el) {
          return element.el.forEach(function(child_el) {
            return parent_el.prepend(child_el);
          });
        });
      }
      return this;
    };

    FrameworkDomElement.prototype.prev = function() {
      if (this.length === 0) {
        return;
      }
      return el(this.el[0].previousElementSibling);
    };

    FrameworkDomElement.prototype.remove = function() {
      this.el.forEach(function(el) {
        return el.parentNode.removeChild(el);
      });
      return delete this;
    };

    FrameworkDomElement.prototype.removeAttr = function(attr) {
      if (!attr) {
        return;
      }
      if (this.length) {
        this.el.forEach(function(el) {
          return el.removeAttribute(attr);
        });
      }
      return this;
    };

    FrameworkDomElement.prototype.removeClass = function(class_names) {
      if (!(class_names && this.length)) {
        return;
      }
      this.el.forEach(function(el) {
        return class_names.split(' ').forEach(function(class_name) {
          return el.classList.remove(class_name);
        });
      });
      return this;
    };

    FrameworkDomElement.prototype.replaceWith = function(element) {
      if (this.length) {
        this.el[0].replaceWith(element.el[0]);
      }
      return this;
    };

    FrameworkDomElement.prototype.scrollTop = function(position) {
      if (this.length === 0) {
        return;
      }
      if (position) {
        return this.el[0].scrollTop = position;
      } else {
        return this.el[0].scrollTop;
      }
    };

    FrameworkDomElement.prototype.setAttribute = function(attribute, value) {
      if (!(attribute || value)) {
        return;
      }
      if (this.length) {
        this.el.forEach(function(el) {
          return el.setAttribute(attribute, value);
        });
        return this;
      }
    };

    FrameworkDomElement.prototype.show = function() {
      if (this.length === 0) {
        return;
      }
      this.el.forEach(function(el) {
        return el.style.display = "block";
      });
      return this;
    };

    FrameworkDomElement.prototype.siblings = function(selector) {
      if (this.length === 0) {
        return;
      }
      return el(selector, this.el[0].parentNode);
    };

    FrameworkDomElement.prototype.submit = function() {
      if (this.length === 0) {
        return;
      }
      return this.el[0].submit();
    };

    FrameworkDomElement.prototype.text = function(text) {
      if (this.length === 0) {
        return this;
      }
      if (!text) {
        return this.el[0].textContent;
      } else {
        this.el[0].textContent = text;
      }
      return this;
    };

    FrameworkDomElement.prototype.trigger = function(types) {
      var elements;
      if (!types) {
        return;
      }
      elements = this.el;
      types.split(" ").forEach(function(type) {
        var event;
        event = new Event(type.split(".")[0], {
          "bubbles": true
        });
        return elements.forEach(function(el) {
          return el.dispatchEvent(event);
        });
      });
      return this;
    };

    FrameworkDomElement.prototype.val = function(new_value) {
      if (this.length === 0) {
        return;
      }
      if (!new_value) {
        return this.el[0].value;
      } else {
        this.el[0].value = new_value;
      }
      return this;
    };

    FrameworkDomElement.prototype.width = function(width) {
      if (this.length === 0) {
        return;
      }
      if (!width) {
        return this.el[0].offsetWidth;
      } else {
        return this.el.forEach(function(el) {
          return el.style.width = width + "px";
        });
      }
    };

    FrameworkDomElement.prototype.wrapAll = function(prepended_html, appended_html) {
      if (this.length === 0) {
        return;
      }
      this.el.forEach(function(el) {
        var new_html, org_html;
        org_html = el.outerHTML;
        new_html = prepended_html + org_html + appended_html;
        return el.outerHTML = new_html;
      });
      return this;
    };

    FrameworkDomElement.prototype.wrapInner = function(prepended_html, appended_html) {
      if (this.length === 0) {
        return;
      }
      this.el.forEach(function(el) {
        var new_html, org_html;
        org_html = el.innerHTML;
        new_html = prepended_html + org_html + appended_html;
        return el.innerHTML = new_html;
      });
      return this;
    };

    return FrameworkDomElement;

  })();

  theme.classes.FrameworkFeaturedBlog = (function() {
    function FrameworkFeaturedBlog(root) {
      var _this;
      this.root = root;
      this.resizeListeners = bind(this.resizeListeners, this);
      this.matchImageHeights = bind(this.matchImageHeights, this);
      _this = this;
      _this.item_container = _this.root.find('.featured-blog--body');
      _this.items = _this.root.find('.featured-blog--item');
      _this.matchImageHeights();
      _this.resizeListeners();
    }

    FrameworkFeaturedBlog.prototype.matchImageHeights = function() {
      var _this;
      _this = this;
      return theme.utils.matchImageHeights(_this.item_container, _this.items, '.featured-blog--item--image');
    };

    FrameworkFeaturedBlog.prototype.resizeListeners = function() {
      var _this;
      _this = this;
      return $(window).on('resize.FeaturedGrid', theme.utils.debounce(100, function() {
        return _this.matchImageHeights();
      }));
    };

    return FrameworkFeaturedBlog;

  })();

  theme.classes.FrameworkFeaturedCollection = (function() {
    function FrameworkFeaturedCollection(root) {
      var _this;
      this.root = root;
      this.hoverImagesLoaded = bind(this.hoverImagesLoaded, this);
      this.setGreatestHeight = bind(this.setGreatestHeight, this);
      this.sectionListeners = bind(this.sectionListeners, this);
      this.load = bind(this.load, this);
      _this = this;
      _this.display_type = _this.root.data('display-type');
      _this.section_id = _this.root.data('section-id');
      _this.items = _this.root.find('.product--root');
      _this.load();
    }

    FrameworkFeaturedCollection.prototype.load = function() {
      var _this;
      _this = this;
      _this.sectionListeners();
      _this.setGreatestHeight();
      if (theme.settings.hover_image_enabled) {
        _this.hoverImagesLoaded();
      }
      return theme.window.on("resize." + _this.section_id, theme.utils.debounce(100, function() {
        return _this.setGreatestHeight();
      }));
    };

    FrameworkFeaturedCollection.prototype.sectionListeners = function() {
      var _this;
      _this = this;
      return _this.root.on('theme:section:unload', function() {
        return theme.window.off("resize." + _this.section_id);
      });
    };

    FrameworkFeaturedCollection.prototype.setGreatestHeight = function() {
      var _this, greatest_image_height;
      _this = this;
      if (_this.display_type === 'grid') {
        return theme.utils.matchImageHeights(_this.root.find('.featured-collection--grid'), _this.root.find('.product--root'), '.product--image-wrapper');
      } else {
        greatest_image_height = 0;
        _this.items.each(function(item) {
          var this_height;
          if (el(item).find('.image--root').length > 0) {
            this_height = el(item).find('.product--image-wrapper .image--root').outerHeight();
          } else {
            this_height = el(item).find('.placeholder--root').outerHeight();
          }
          if (this_height > greatest_image_height) {
            return greatest_image_height = this_height;
          }
        });
        return _this.items.find('.product--image-wrapper, .placeholder--root').height(greatest_image_height);
      }
    };

    FrameworkFeaturedCollection.prototype.hoverImagesLoaded = function() {
      var _this;
      _this = this;
      return _this.root.find('.product--hover-image').each(function(image) {
        var hover_image;
        hover_image = el(image);
        return theme.utils.imagesLoaded(hover_image, function() {
          var product;
          product = hover_image.closest('[data-hover-image="true"]');
          return product.attr('data-hover-image', 'loaded');
        });
      });
    };

    return FrameworkFeaturedCollection;

  })();

  theme.classes.FrameworkFeaturedCollections = (function() {
    function FrameworkFeaturedCollections(root) {
      var _this;
      this.root = root;
      this.resizeListeners = bind(this.resizeListeners, this);
      this.matchImageHeights = bind(this.matchImageHeights, this);
      this.load = bind(this.load, this);
      _this = this;
      _this.item_container = _this.root.find('.featured-collections--body');
      _this.items = _this.root.find('.featured-collections--item');
      _this.load();
    }

    FrameworkFeaturedCollections.prototype.load = function() {
      var _this;
      _this = this;
      _this.matchImageHeights();
      return _this.resizeListeners();
    };

    FrameworkFeaturedCollections.prototype.matchImageHeights = function() {
      var _this;
      _this = this;
      return theme.utils.matchImageHeights(_this.item_container, _this.items, '.featured-collections--image');
    };

    FrameworkFeaturedCollections.prototype.resizeListeners = function() {
      var _this;
      _this = this;
      return theme.window.on('resize.FeaturedCollections', theme.utils.debounce(100, function() {
        return _this.matchImageHeights();
      }));
    };

    return FrameworkFeaturedCollections;

  })();

  theme.classes.FrameworkFeaturedGrid = (function() {
    function FrameworkFeaturedGrid(root) {
      var _this;
      this.root = root;
      this.resizeListeners = bind(this.resizeListeners, this);
      this.matchImageHeights = bind(this.matchImageHeights, this);
      _this = this;
      _this.item_container = _this.root.find('.featured-grid--body--container');
      _this.items = _this.root.find('.featured-grid--item');
      _this.text_position = _this.root.attr('data-text-position');
      _this.mobile_overlay = _this.root.data('mobile-overlay');
      _this.matchImageHeights();
      _this.resizeListeners();
    }

    FrameworkFeaturedGrid.prototype.matchImageHeights = function() {
      var _this;
      _this = this;
      if (_this.text_position === 'bottom' || (theme.utils.mqs.current_window === 'small' && !_this.mobile_overlay)) {
        return theme.utils.matchImageHeights(_this.item_container, _this.items, '.featured-grid--item--image');
      }
    };

    FrameworkFeaturedGrid.prototype.resizeListeners = function() {
      var _this;
      _this = this;
      return theme.window.on('resize.FeaturedGrid', theme.utils.debounce(100, function() {
        _this.items.find('.featured-grid--item--image, .placeholder--root').css('height', '100%');
        return _this.matchImageHeights();
      }));
    };

    return FrameworkFeaturedGrid;

  })();

  theme.classes.FrameworkFeaturedVideo = (function() {
    function FrameworkFeaturedVideo(root) {
      var _this;
      this.root = root;
      this.hideThumbnail = bind(this.hideThumbnail, this);
      this.playButtonListener = bind(this.playButtonListener, this);
      this.disablePlayerFocus = bind(this.disablePlayerFocus, this);
      this.vimeoEvents = bind(this.vimeoEvents, this);
      this.insertVimeoPlayer = bind(this.insertVimeoPlayer, this);
      this.youtubeEvents = bind(this.youtubeEvents, this);
      this.youtubeReady = bind(this.youtubeReady, this);
      this.insertYoutubePlayer = bind(this.insertYoutubePlayer, this);
      this.insertAPIScript = bind(this.insertAPIScript, this);
      this.playerInit = bind(this.playerInit, this);
      this.checkAPIScriptExists = bind(this.checkAPIScriptExists, this);
      _this = this;
      _this.play_buttons = _this.root.find('.feature-video--play svg, .feature-video--play-mobile svg');
      _this.section_id = _this.root.attr('data-section-id');
      _this.thumbnail = _this.root.data('thumbnail');
      _this.video_type = _this.root.data('video-type');
      _this.video_id = _this.root.data('video-id');
      _this.vimeoVars = {
        id: _this.video_id,
        autopause: 0,
        playsinline: 0,
        title: 0
      };
      _this.youtubeVars = {};
      if (_this.thumbnail) {
        _this.playButtonListener();
      } else {
        _this.checkAPIScriptExists();
      }
    }

    FrameworkFeaturedVideo.prototype.checkAPIScriptExists = function() {
      var _this;
      _this = this;
      if (_this.video_type === 'vimeo') {
        if (theme.utils.vimeo_script_added) {
          return _this.playerInit();
        } else {
          return _this.insertAPIScript();
        }
      } else {
        if (theme.utils.youtube_script_added) {
          return _this.playerInit();
        } else {
          return _this.insertAPIScript();
        }
      }
    };

    FrameworkFeaturedVideo.prototype.playerInit = function() {
      var _this;
      _this = this;
      if (_this.video_type === 'vimeo') {
        if (_this.thumbnail) {
          return _this.insertVimeoPlayer();
        } else {
          window.addEventListener('load', function() {
            return _this.insertVimeoPlayer();
          });
          return _this.root.on('theme:section:load', function() {
            return _this.insertVimeoPlayer();
          });
        }
      } else {
        if (_this.thumbnail) {
          return _this.insertYoutubePlayer();
        } else {
          window.addEventListener('load', function() {
            return _this.insertYoutubePlayer();
          });
          return _this.root.on('theme:section:load', function() {
            return _this.insertYoutubePlayer();
          });
        }
      }
    };

    FrameworkFeaturedVideo.prototype.insertAPIScript = function() {
      var _this;
      _this = this;
      if (_this.video_type === 'vimeo') {
        theme.utils.vimeo_script_added = true;
        return theme.utils.insertScript('https://player.vimeo.com/api/player.js', function() {
          return _this.insertVimeoPlayer();
        });
      } else {
        theme.utils.youtube_script_added = true;
        theme.utils.insertScript('https://www.youtube.com/iframe_api');
        return window.addEventListener('theme:utils:youtubeAPIReady', function() {
          return _this.insertYoutubePlayer();
        });
      }
    };

    FrameworkFeaturedVideo.prototype.insertYoutubePlayer = function() {
      var _this;
      _this = this;
      if (!_this.thumbnail) {
        _this.youtubeVars.enablejsapi = 1;
        _this.youtubeVars.origin = window.location.href;
        _this.youtubeVars.playsinline = 1;
        _this.youtubeVars.fs = 0;
        _this.youtubeVars.loop = 1;
        _this.youtubeVars.playlist = _this.video_id;
      }
      if (typeof YT !== 'undefined') {
        return _this.player = new YT.Player("player-" + _this.section_id, {
          videoId: _this.video_id,
          playerVars: _this.youtubeVars,
          events: {
            'onReady': _this.youtubeReady,
            'onStateChange': _this.youtubeEvents
          }
        });
      }
    };

    FrameworkFeaturedVideo.prototype.youtubeReady = function() {
      var _this;
      _this = this;
      if (!_this.thumbnail) {
        _this.player.mute();
        _this.disablePlayerFocus();
      }
      return _this.player.playVideo();
    };

    FrameworkFeaturedVideo.prototype.youtubeEvents = function(event) {
      var YTP, _this, remains;
      _this = this;
      YTP = event.target;
      if (_this.thumbnail) {
        if (event.data === 0) {
          YTP.seekTo(0);
          return YTP.pauseVideo();
        }
      } else {
        if (event.data === 1) {
          remains = YTP.getDuration() - YTP.getCurrentTime();
          if (_this.rewindTO) {
            clearTimeout(_this.rewindTO);
          }
          return _this.rewindTO = setTimeout(function() {
            YTP.seekTo(0);
          }, (remains - 0.1) * 1000);
        }
      }
    };

    FrameworkFeaturedVideo.prototype.insertVimeoPlayer = function() {
      var _this;
      _this = this;
      if (!_this.thumbnail) {
        _this.vimeoVars.playsinline = 1;
        _this.vimeoVars.muted = 1;
        _this.vimeoVars.background = 1;
        _this.vimeoVars.loop = 1;
      }
      _this.player = new Vimeo.Player("player-" + _this.section_id, _this.vimeoVars);
      if (_this.thumbnail) {
        _this.vimeoEvents();
      } else {
        _this.player.ready().then(function() {
          return _this.disablePlayerFocus();
        });
      }
      return _this.player.play();
    };

    FrameworkFeaturedVideo.prototype.vimeoEvents = function() {
      var _this;
      _this = this;
      _this.player.getDuration().then(function(duration) {
        return _this.player.addCuePoint(duration - 0.3, {});
      });
      return _this.player.on('cuepoint', function() {
        _this.player.setCurrentTime(0);
        return _this.player.pause();
      });
    };

    FrameworkFeaturedVideo.prototype.disablePlayerFocus = function() {
      var _this;
      _this = this;
      return _this.root.find('iframe').attr('tabindex', '-1');
    };

    FrameworkFeaturedVideo.prototype.playButtonListener = function() {
      var _this;
      _this = this;
      _this.play_buttons.attr('tabindex', '0');
      return _this.play_buttons.on('click keydown', function(event) {
        if (event.type === 'keydown' && event.key !== 'Enter') {
          return;
        }
        _this.checkAPIScriptExists();
        return _this.hideThumbnail();
      });
    };

    FrameworkFeaturedVideo.prototype.hideThumbnail = function() {
      var _this;
      _this = this;
      return setTimeout(function() {
        return _this.root.find('.feature-video--header, .feature-video--thumbnail, .feature-video--play-mobile').hide();
      }, 350);
    };

    return FrameworkFeaturedVideo;

  })();

  theme.classes.FrameworkFeedbackBar = (function() {
    function FrameworkFeedbackBar(root) {
      var _this;
      this.root = root;
      this.load = bind(this.load, this);
      _this = this;
      _this.messages = _this.root.find('.feedback-bar--message > *');
      _this.load();
    }

    FrameworkFeedbackBar.prototype.load = function() {
      var _this, anchor_tag, message, message_elem;
      _this = this;
      _this.messages.hide();
      anchor_tag = window.location.hash.substr(1);
      message = anchor_tag.replace('feedback-bar--', '');
      message_elem = _this.messages.filter("[data-message='" + message + "']");
      if (message_elem.length) {
        message_elem.show();
        setTimeout(function() {
          return _this.root.attr('data-open', 'true');
        }, 200);
        return setTimeout(function() {
          return _this.root.attr('data-open', 'false');
        }, 3000);
      }
    };

    return FrameworkFeedbackBar;

  })();

  theme.classes.FrameworkFooter = (function() {
    function FrameworkFooter(root) {
      var _this;
      this.root = root;
      this.stickyFooter = bind(this.stickyFooter, this);
      this.addListeners = bind(this.addListeners, this);
      this.load = bind(this.load, this);
      _this = this;
      _this.header = el('.header--root');
      _this.main_content = el('.layout--main-content');
      _this.load();
    }

    FrameworkFooter.prototype.load = function() {
      var _this;
      _this = this;
      _this.addListeners();
      return _this.stickyFooter();
    };

    FrameworkFooter.prototype.addListeners = function() {
      var _this;
      _this = this;
      theme.window.on('resize theme:cart:updated', function() {
        return _this.stickyFooter();
      });
      return document.addEventListener('shopify:section:load', function() {
        return _this.stickyFooter();
      });
    };

    FrameworkFooter.prototype.stickyFooter = function() {
      var _this, reduce_window_by, total_content_height;
      _this = this;
      _this.main_content.css('min-height', 'unset');
      total_content_height = _this.header.outerHeight() + _this.main_content.outerHeight() + _this.root.outerHeight();
      if (el('body').data('border')) {
        if (theme.utils.mqs.current_window === 'small') {
          total_content_height += 8 * 2;
        } else {
          total_content_height += 12 * 2;
        }
      }
      if (el('.announcement--root').length > 0) {
        total_content_height += el('.announcement--root').outerHeight();
      }
      if (window.innerHeight > total_content_height) {
        reduce_window_by = total_content_height - _this.main_content.outerHeight();
        return _this.main_content.css('min-height', (window.innerHeight - reduce_window_by) + "px");
      }
    };

    return FrameworkFooter;

  })();

  theme.classes.FrameworkMap = (function() {
    function FrameworkMap(root) {
      var _this;
      this.root = root;
      this.buildStyles = bind(this.buildStyles, this);
      this.buildMap = bind(this.buildMap, this);
      this.geolocate = bind(this.geolocate, this);
      this.loadMapsApi = bind(this.loadMapsApi, this);
      this.load = bind(this.load, this);
      _this = this;
      _this.api_status = null;
      _this.map_instance = null;
      _this.key = _this.root.data('api-key');
      _this.address = _this.root.attr('data-address');
      _this.theme = _this.root.data('theme');
      _this.styles = null;
      _this.container = _this.root.find('.map--google-maps');
      _this.center = null;
      _this.load();
    }

    FrameworkMap.prototype.load = function() {
      var _this;
      _this = this;
      if (_this.container.length > 0) {
        return _this.loadMapsApi();
      }
    };

    FrameworkMap.prototype.loadMapsApi = function() {
      var _this, other_map_loading_checker;
      _this = this;
      if (theme.utils.google_maps_script_status === 'loading') {
        return other_map_loading_checker = setInterval(function() {
          if (theme.utils.google_maps_script_status === 'loaded') {
            _this.geolocate();
            return clearInterval(other_map_loading_checker);
          }
        }, 100);
      } else if (typeof window.google === 'undefined') {
        theme.utils.google_maps_script_status = 'loading';
        return theme.utils.insertScript("https://maps.googleapis.com/maps/api/js?key=" + _this.key, function() {
          _this.geolocate();
          return theme.utils.google_maps_script_status = 'loaded';
        });
      } else {
        return _this.geolocate();
      }
    };

    FrameworkMap.prototype.geolocate = function() {
      var _this, geocoder;
      _this = this;
      geocoder = new google.maps.Geocoder;
      return geocoder.geocode({
        address: _this.address
      }, function(results, status) {
        if (status === 'OK') {
          _this.center = results[0].geometry.location;
          _this.buildStyles();
          return _this.buildMap();
        } else {
          return console.log('couldn\'t convert address with geocoder');
        }
      });
    };

    FrameworkMap.prototype.buildMap = function() {
      var _this, center, map, mapOptions, marker;
      _this = this;
      mapOptions = {
        zoom: 15,
        center: _this.center,
        disableDefaultUI: true,
        zoomControl: true,
        scrollwheel: false,
        styles: _this.styles
      };
      map = new google.maps.Map(_this.container.el[0], mapOptions);
      center = map.getCenter();
      marker = new google.maps.Marker({
        map: map,
        position: map.getCenter()
      });
      return _this.map_instance = google.maps.event.addDomListener(window, 'resize', theme.utils.debounce(500, function() {
        google.maps.event.trigger(map, 'resize');
        map.setCenter(center);
      }));
    };

    FrameworkMap.prototype.buildStyles = function() {
      var _this;
      _this = this;
      if (_this.theme === 'grayscale') {
        return _this.styles = [
          {
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#f5f5f5"
              }
            ]
          }, {
            "elementType": "labels.icon",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          }, {
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#616161"
              }
            ]
          }, {
            "elementType": "labels.text.stroke",
            "stylers": [
              {
                "color": "#f5f5f5"
              }
            ]
          }, {
            "featureType": "administrative.land_parcel",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#bdbdbd"
              }
            ]
          }, {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#eeeeee"
              }
            ]
          }, {
            "featureType": "poi",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#757575"
              }
            ]
          }, {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#e5e5e5"
              }
            ]
          }, {
            "featureType": "poi.park",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#9e9e9e"
              }
            ]
          }, {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#ffffff"
              }
            ]
          }, {
            "featureType": "road.arterial",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#757575"
              }
            ]
          }, {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#dadada"
              }
            ]
          }, {
            "featureType": "road.highway",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#616161"
              }
            ]
          }, {
            "featureType": "road.local",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#9e9e9e"
              }
            ]
          }, {
            "featureType": "transit.line",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#e5e5e5"
              }
            ]
          }, {
            "featureType": "transit.station",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#eeeeee"
              }
            ]
          }, {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#c9c9c9"
              }
            ]
          }, {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#9e9e9e"
              }
            ]
          }
        ];
      } else if (_this.theme === 'dark') {
        return _this.styles = [
          {
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#212121"
              }
            ]
          }, {
            "elementType": "labels.icon",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          }, {
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#757575"
              }
            ]
          }, {
            "elementType": "labels.text.stroke",
            "stylers": [
              {
                "color": "#212121"
              }
            ]
          }, {
            "featureType": "administrative",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#757575"
              }
            ]
          }, {
            "featureType": "administrative.country",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#9e9e9e"
              }
            ]
          }, {
            "featureType": "administrative.land_parcel",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          }, {
            "featureType": "administrative.locality",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#bdbdbd"
              }
            ]
          }, {
            "featureType": "poi",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#757575"
              }
            ]
          }, {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#181818"
              }
            ]
          }, {
            "featureType": "poi.park",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#616161"
              }
            ]
          }, {
            "featureType": "poi.park",
            "elementType": "labels.text.stroke",
            "stylers": [
              {
                "color": "#1b1b1b"
              }
            ]
          }, {
            "featureType": "road",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#2c2c2c"
              }
            ]
          }, {
            "featureType": "road",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#8a8a8a"
              }
            ]
          }, {
            "featureType": "road.arterial",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#373737"
              }
            ]
          }, {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#3c3c3c"
              }
            ]
          }, {
            "featureType": "road.highway.controlled_access",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#4e4e4e"
              }
            ]
          }, {
            "featureType": "road.local",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#616161"
              }
            ]
          }, {
            "featureType": "transit",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#757575"
              }
            ]
          }, {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [
              {
                "color": "#000000"
              }
            ]
          }, {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#3d3d3d"
              }
            ]
          }
        ];
      }
    };

    return FrameworkMap;

  })();

  theme.classes.FrameworkMediaQueries = (function() {
    function FrameworkMediaQueries() {
      this.screenSizeListener = bind(this.screenSizeListener, this);
      this.getScreenSize = bind(this.getScreenSize, this);
      this.medium_screen = 768;
      this.large_screen = 1024;
      this.current_window = null;
      this.getScreenSize();
      this.screenSizeListener();
    }

    FrameworkMediaQueries.prototype.getScreenSize = function() {
      var _this, mq_updated_event, previous_window;
      _this = this;
      previous_window = _this.current_window;
      if (window.matchMedia("only screen and (min-width: " + _this.large_screen + "px)").matches) {
        if (_this.current_window !== 'large') {
          _this.current_window = 'large';
        }
      } else if (window.matchMedia("only screen and (min-width: " + _this.medium_screen + "px)").matches) {
        if (_this.current_window !== 'medium') {
          _this.current_window = 'medium';
        }
      } else {
        if (_this.current_window !== 'small') {
          _this.current_window = 'small';
        }
      }
      if (_this.current_window !== previous_window) {
        mq_updated_event = new Event('theme:utils:mqs:updated');
        return window.dispatchEvent(mq_updated_event);
      }
    };

    FrameworkMediaQueries.prototype.screenSizeListener = function() {
      var _this;
      _this = this;
      return window.addEventListener('resize', function() {
        return _this.getScreenSize();
      });
    };

    return FrameworkMediaQueries;

  })();

  theme.classes.FrameworkModal = (function() {
    function FrameworkModal(root) {
      var _this;
      this.root = root;
      this.transitionListeners = bind(this.transitionListeners, this);
      _this = this;
      _this.fullscreen = _this.root.data('modal-fullscreen') ? true : false;
      if (_this.root.data('modal-custom-close')) {
        _this.custom_close_button = _this.root.data('modal-custom-close');
      } else {
        _this.custom_close_button = '';
      }
      _this.force_view = _this.root.data('force-view');
      _this.view = _this.root.data('modal-view');
      _this.viewport = el('.offcanvas--viewport');
      _this.nested_links = _this.root.find(':scope .modal--root .modal--link');
      _this.nested_content = _this.root.find(':scope .modal--root .modal--content');
      _this.links = _this.root.find('.modal--link').not(_this.nested_links);
      _this.content = _this.root.find('.modal--content').not(_this.nested_content);
      _this.window = el('.modal--window');
      _this.window_container = _this.window.find('.modal--container');
      _this.mask = _this.window.find('.modal--mask');
      _this.close_button = _this.window.find('.modal--close');
      _this.next_button = _this.window.find('.modal--next');
      _this.prev_button = _this.window.find('.modal--prev');
      _this.slider = null;
      _this.slides = null;
      _this.main_content_window = el('.off-canvas--main-content');
      _this.openListeners();
      _this.transitionListeners();
      _this.modal_state = 'closed';
      _this.nav_lock = false;
    }

    FrameworkModal.prototype.openListeners = function() {
      var _this;
      _this = this;
      return _this.links.on('keypress.FrameworkModal, click.FrameworkModal, quick-open', function(event) {
        var clicked_item;
        if (event.type === 'keypress' && theme.utils.a11yClick(event) === false) {
          return false;
        }
        clicked_item = el(this);
        _this.links.each(function(link, index) {
          if (el(link).is(clicked_item)) {
            if (event.type === 'quick-open') {
              return _this.open(index, true);
            } else {
              return _this.open(index);
            }
          }
        });
        event.preventDefault();
        return event.stopPropagation();
      });
    };

    FrameworkModal.prototype.open = function(index, quick_open) {
      var _this, scrolled_position;
      if (quick_open == null) {
        quick_open = false;
      }
      _this = this;
      if (_this.modal_state === 'closed') {
        _this.modal_state = 'opened';
        el('body').attr('data-modal-open', true);
        theme.window.trigger('theme:modal:opened');
        _this.window.attr('data-modal-fullscreen', _this.fullscreen);
        _this.window.attr('data-modal-custom-close', _this.custom_close_button);
        _this.window.attr('data-modal-view', _this.view);
        _this.viewport.css('overflow', 'hidden');
        _this.closeListeners();
        _this.positionListeners();
        scrolled_position = window.pageYOffset;
        _this.main_content_window.css('position', 'fixed');
        _this.main_content_window.css('top', "-" + scrolled_position + "px");
        _this.moveContentToWindow();
        if (_this.slides.length > 1) {
          _this.next_button.show();
          _this.prev_button.show();
          _this.prevListeners();
          _this.nextListeners();
        }
        _this.window.css('visibility', 'visible');
        _this.window_container.show();
        _this.renderVideo(_this.slides.eq(index));
        if (quick_open) {
          _this.slides.eq(index).addClass('active');
          return _this.position();
        } else {
          _this.mask.attr('data-transition', 'forwards');
          return _this.loadModal(_this.slides.eq(index), function() {
            return setTimeout(function() {
              return _this.window_container.find('input[type="text"]').focus();
            }, 0);
          });
        }
      }
    };

    FrameworkModal.prototype.moveContentToWindow = function() {
      var _this, content;
      _this = this;
      content = _this.root.find('.modal--content').not(_this.nested_content);
      _this.window_container.append(content);
      return _this.slides = _this.window_container.find('.modal--content');
    };

    FrameworkModal.prototype.renderVideo = function(slide) {
      var _this, id, iframe, src_url, type, video;
      _this = this;
      video = slide.find('.responsive-video').first();
      if (video.length) {
        src_url = video.data('video');
        type = _this.extractVideoType(src_url);
        id = _this.extractVideoId(src_url, type);
        iframe = _this.createIframe(type, id);
        if (type === 'vimeo') {
          video.addClass('vimeo');
        }
        if (type === 'kickstarter') {
          video.addClass('kickstarter');
        }
        return video.append(iframe);
      }
    };

    FrameworkModal.prototype.extractVideoType = function(src_url) {
      var _this, matches, re;
      _this = this;
      re = /\/\/(?:www\.)?youtu(?:\.be|be\.com)\/(?:watch\?v=|embed\/)?([a-z0-9_\-]+)/i;
      matches = re.exec(src_url);
      if (matches) {
        return 'youtube';
      }
      re = /^.*(vimeo)\.com\/(?:watch\?v=)?(.*?)(?:\z|$|&)/;
      matches = re.exec(src_url);
      if (matches) {
        return 'vimeo';
      }
      re = /^.*(kickstarter)\.com/g;
      matches = re.exec(src_url);
      if (matches) {
        return 'kickstarter';
      }
      return false;
    };

    FrameworkModal.prototype.extractVideoId = function(src_url, type) {
      var _this, match, regExp;
      _this = this;
      if (type === 'youtube') {
        regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        match = src_url.match(regExp);
        if (match && match[2].length === 11) {
          return match[2];
        }
      } else if (type === "vimeo") {
        regExp = /^.*(vimeo)\.com\/(?:watch\?v=)?(.*?)(?:\z|$|&)/;
        match = src_url.match(regExp);
        if (match) {
          return match[2];
        }
      } else if (type === "kickstarter") {
        regExp = /(?:kickstarter\.com\/projects\/)(.*)(|\?)/;
        match = src_url.match(regExp);
        if (match) {
          return match[1];
        }
      }
    };

    FrameworkModal.prototype.createIframe = function(type, id) {
      var _this;
      _this = this;
      if (type === "youtube") {
        return "<iframe src='//www.youtube.com/embed/" + id + "?autoplay=1' frameborder='0' allowfullwidth></iframe>";
      } else if (type === "vimeo") {
        return "<iframe src='//player.vimeo.com/video/" + id + "?title=0&amp;byline=0&amp;portrait=0&amp;color=ffffff&amp;autoplay=1?' frameborder='0' webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>";
      } else if (type === "kickstarter") {
        return "<iframe src='//www.kickstarter.com/projects/" + id + "/widget/video.html' frameborder='0' webkitallowfullwidth mozallowfullwidth allowfullwidth></iframe>";
      }
    };

    FrameworkModal.prototype.removeVideos = function() {
      var _this;
      _this = this;
      return _this.slides.find('.responsive-video').each(function(video) {
        if (el(video).data('video')) {
          return el(video).find('iframe').remove();
        }
      });
    };

    FrameworkModal.prototype.loadModal = function(modal, callback) {
      var _this;
      _this = this;
      modal.addClass('active');
      _this.position();
      if (callback) {
        callback();
      }
      return _this.nav_lock = false;
    };

    FrameworkModal.prototype.position = function() {
      var _this, active_modal, entire_modal_height, modal_height, modal_width;
      _this = this;
      if (_this.window_container != null) {
        active_modal = _this.content.filter('.active');
        _this.window_container.removeAttr('style');
        _this.window.removeClass('fixed');
        modal_height = active_modal.outerHeight();
        modal_width = active_modal.outerWidth();
        entire_modal_height = modal_height + parseInt(_this.window.css('padding-top')) + parseInt(_this.window.css('padding-bottom'));
        if (_this.fullscreen) {
          return;
        }
        if (active_modal.hasClass('type--image')) {
          entire_modal_height = modal_height;
        }
        if (window.innerHeight >= entire_modal_height && _this.force_view !== 'absolute') {
          return _this.window.addClass('fixed');
        } else {
          document.querySelectorAll('html, body').forEach(function(el) {
            return el.scrollTo(0, 0);
          });
          return _this.window.removeClass('fixed');
        }
      }
    };

    FrameworkModal.prototype.positionListeners = function() {
      var _this;
      _this = this;
      return theme.window.on('resize.FrameworkModal', function() {
        return _this.position();
      });
    };

    FrameworkModal.prototype.nextListeners = function() {
      var _this;
      _this = this;
      el(document).on('keydown.FrameworkModal', function(event) {
        if (event.keyCode === 39) {
          return _this.next();
        }
      });
      return _this.next_button.on('click.FrameworkModal', function() {
        return _this.next();
      });
    };

    FrameworkModal.prototype.next = function() {
      var _this, active_slide, index;
      _this = this;
      if (!_this.nav_lock) {
        _this.nav_lock = true;
        index = _this.slides.filter('.active').index();
        _this.slides.removeClass('active');
        _this.removeVideos();
        if ((index + 1) === _this.slides.length) {
          active_slide = _this.slides.eq(0);
        } else {
          active_slide = _this.slides.eq(index + 1);
        }
        _this.renderVideo(active_slide);
        return _this.loadModal(active_slide);
      }
    };

    FrameworkModal.prototype.prevListeners = function() {
      var _this;
      _this = this;
      el(document).on('keydown.FrameworkModal', function(event) {
        if (event.keyCode === 37) {
          return _this.prev();
        }
      });
      return _this.prev_button.on('click.FrameworkModal', function() {
        return _this.prev();
      });
    };

    FrameworkModal.prototype.prev = function() {
      var _this, active_slide, index;
      _this = this;
      if (!_this.nav_lock) {
        _this.nav_lock = true;
        index = _this.slides.filter('.active').index();
        _this.slides.removeClass('active');
        _this.removeVideos();
        if (index === 0) {
          active_slide = _this.slides.eq(_this.slides.length - 1);
        } else {
          active_slide = _this.slides.eq(index - 1);
        }
        _this.renderVideo(active_slide);
        return _this.loadModal(active_slide);
      }
    };

    FrameworkModal.prototype.closeListeners = function() {
      var _this;
      _this = this;
      _this.root.on('quick-close', function() {
        return _this.close(true);
      });
      el(document).on('keydown.FrameworkModal', function(event) {
        if (event.keyCode === 27) {
          return _this.close();
        }
      });
      _this.mask.on('click.FrameworkModal', function() {
        return _this.close();
      });
      _this.window_container.on('click.FrameworkModal', function() {
        return _this.close();
      });
      _this.content.on('click.FrameworkModal', function(event) {
        return event.stopPropagation();
      });
      return _this.close_button.on('click.FrameworkModal keydown.FrameworkModal', function() {
        if (event.type === 'keydown' && event.key !== 'Enter') {
          return;
        }
        return _this.close();
      });
    };

    FrameworkModal.prototype.close = function(quick_close) {
      var _this, scrolled_position;
      if (quick_close == null) {
        quick_close = false;
      }
      _this = this;
      scrolled_position = parseInt(_this.main_content_window.css('top')) * -1;
      el('body').attr('data-modal-open', false);
      theme.window.trigger('theme:modal:closed');
      _this.main_content_window.css('top', '0');
      _this.main_content_window.css('position', 'relative');
      _this.viewport.css('overflow', 'unset');
      window.scrollTo(0, scrolled_position);
      _this.putBackContent();
      _this.next_button.hide();
      _this.prev_button.hide();
      _this.window.css('visibility', 'hidden');
      if (quick_close) {
        _this.mask.hide();
        _this.window_container.empty();
        _this.modal_state = 'closed';
      } else {
        _this.mask.attr('data-transition', 'backwards');
      }
      return _this.removeListeners();
    };

    FrameworkModal.prototype.putBackContent = function() {
      var _this;
      _this = this;
      _this.removeVideos();
      return _this.root.append(_this.slides.removeClass('active'));
    };

    FrameworkModal.prototype.removeListeners = function() {
      var _this;
      _this = this;
      el(document).off('keydown.FrameworkModal');
      theme.window.off('resize.FrameworkModal');
      el('body,html').off('DOMMouseScroll.FrameworkModal mousewheel.FrameworkModal touchmove.FrameworkModal');
      _this.next_button.off('click.FrameworkModal');
      _this.prev_button.off('click.FrameworkModal');
      _this.close_button.off('click.FrameworkModal');
      _this.close_button.off('keydown.FrameworkModal');
      _this.mask.off('click.FrameworkModal');
      return _this.window_container.off('click.FrameworkModal');
    };

    FrameworkModal.prototype.transitionListeners = function() {
      var _this;
      _this = this;
      return _this.mask.on('transition:at_start', function() {
        _this.window_container.empty();
        return _this.modal_state = 'closed';
      });
    };

    return FrameworkModal;

  })();

  theme.classes.FrameworkOffCanvas = (function() {
    function FrameworkOffCanvas(root) {
      var _this;
      this.root = root;
      this.transitionListeners = bind(this.transitionListeners, this);
      this.touchListener = bind(this.touchListener, this);
      this.setFocus = bind(this.setFocus, this);
      this.closeRightComplete = bind(this.closeRightComplete, this);
      this.closeRight = bind(this.closeRight, this);
      this.closeLeftComplete = bind(this.closeLeftComplete, this);
      this.closeLeft = bind(this.closeLeft, this);
      this.openRightComplete = bind(this.openRightComplete, this);
      this.openRight = bind(this.openRight, this);
      this.openLeftComplete = bind(this.openLeftComplete, this);
      this.openLeft = bind(this.openLeft, this);
      this.toggle = bind(this.toggle, this);
      this.closeWithEscKey = bind(this.closeWithEscKey, this);
      this.closeWhenFocusOut = bind(this.closeWhenFocusOut, this);
      this.toggleListeners = bind(this.toggleListeners, this);
      this.viewPortHeightListener = bind(this.viewPortHeightListener, this);
      this.setViewPortHeight = bind(this.setViewPortHeight, this);
      this.setState = bind(this.setState, this);
      this.unload = bind(this.unload, this);
      this.load = bind(this.load, this);
      _this = this;
      _this.left_sidebar = _this.root.find('.off-canvas--left-sidebar');
      _this.right_sidebar = _this.root.find('.off-canvas--right-sidebar');
      _this.focus_triggers = _this.root.find('.off-canvas--focus-trigger');
      _this.main_content = _this.root.find('.off-canvas--main-content');
      _this.overlay = _this.root.find('.off-canvas--overlay');
      _this.state = 'closed';
      _this.load();
    }

    FrameworkOffCanvas.prototype.load = function() {
      var _this;
      _this = this;
      _this.close = el('[data-off-canvas--close]');
      _this.triggers = el('[data-off-canvas--open]');
      _this.setViewPortHeight();
      _this.viewPortHeightListener();
      _this.toggleListeners();
      _this.touchListener();
      _this.closeWhenFocusOut();
      _this.closeWithEscKey();
      return _this.transitionListeners();
    };

    FrameworkOffCanvas.prototype.unload = function() {
      var _this;
      _this = this;
      _this.triggers.off('click keydown');
      return _this.overlay.add(_this.close).off('click');
    };

    FrameworkOffCanvas.prototype.setState = function(state) {
      var _this;
      _this = this;
      _this.state = state;
      _this.root.attr('data-off-canvas--state', state);
      if (_this.state === 'left--opening') {
        _this.left_sidebar.attr('data-transition', 'forwards');
        _this.overlay.attr('data-transition', 'forwards');
      }
      if (_this.state === 'left--closing') {
        _this.left_sidebar.attr('data-transition', 'backwards');
        _this.overlay.attr('data-transition', 'backwards');
      }
      if (_this.state === 'right--opening') {
        _this.right_sidebar.attr('data-transition', 'forwards');
        _this.overlay.attr('data-transition', 'forwards');
      }
      if (_this.state === 'right--closing') {
        _this.right_sidebar.attr('data-transition', 'backwards');
        return _this.overlay.attr('data-transition', 'backwards');
      }
    };

    FrameworkOffCanvas.prototype.setViewPortHeight = function() {
      var _this;
      _this = this;
      return _this.root.css('min-height', window.innerHeight + "px");
    };

    FrameworkOffCanvas.prototype.viewPortHeightListener = function() {
      var _this;
      _this = this;
      return window.addEventListener('resize', function() {
        return _this.setViewPortHeight();
      });
    };

    FrameworkOffCanvas.prototype.toggleListeners = function() {
      var _this;
      _this = this;
      _this.triggers.on('click keydown', function(event) {
        if (event.type === 'keydown' && event.key !== 'Enter') {
          return;
        }
        _this.last_trigger = el(this);
        if (el(this).data('off-canvas--open') === 'left-sidebar') {
          _this.toggle('left-sidebar');
        } else if (el(this).data('off-canvas--open') === 'right-sidebar') {
          _this.right_sidebar_view = el(this).data('off-canvas--view');
          _this.right_sidebar.attr('data-active', _this.right_sidebar_view);
          if (_this.right_sidebar_view === 'product-form') {
            theme.classes.Product.initQuickAddForm(el(this));
          } else if (_this.right_sidebar_view === 'collection-filter') {
            theme.classes.Collection.toggleFilterMenu(el(this));
          } else if (_this.right_sidebar_view === 'cart' && el(this).data('product-id')) {
            event.preventDefault();
            event.stopPropagation();
            theme.classes.Product.quickAddToCart(el(this));
            return false;
          }
          _this.toggle('right-sidebar');
        }
        event.preventDefault();
        return event.stopPropagation();
      });
      return _this.overlay.add(_this.close).on('click keydown', function() {
        if (event.type === 'keydown' && event.key !== 'Enter') {
          return;
        }
        if (_this.state === 'left--opened') {
          return _this.toggle('left-sidebar');
        } else if (_this.state === 'right--opened') {
          return _this.toggle('right-sidebar');
        }
      });
    };

    FrameworkOffCanvas.prototype.closeWhenFocusOut = function() {
      var _this;
      _this = this;
      return _this.focus_triggers.on('focus', function() {
        if (_this.state === 'left--opened') {
          return _this.closeLeft();
        } else if (_this.state === 'right--opened') {
          return _this.closeRight();
        }
      });
    };

    FrameworkOffCanvas.prototype.closeWithEscKey = function() {
      var _this;
      _this = this;
      return window.addEventListener('keydown', function(event) {
        if (event.key !== 'Escape') {
          return;
        }
        if (_this.state === 'left--opened') {
          return _this.closeLeft();
        } else if (_this.state === 'right--opened') {
          return _this.closeRight();
        }
      });
    };

    FrameworkOffCanvas.prototype.toggle = function(element) {
      var _this;
      _this = this;
      if (element === 'left-sidebar' && _this.state === 'closed') {
        return _this.openLeft();
      } else if (element === 'left-sidebar' && _this.state === 'left--opened') {
        return _this.closeLeft();
      } else if (element === 'right-sidebar' && _this.state === 'closed') {
        return _this.openRight();
      } else if (element === 'right-sidebar' && _this.state === 'right--opened') {
        return _this.closeRight();
      }
    };

    FrameworkOffCanvas.prototype.openLeft = function() {
      var _this;
      _this = this;
      _this.root.css('overflow', 'hidden');
      _this.left_sidebar.css('display', 'block');
      _this.window_offset = window.pageYOffset;
      _this.main_content.css('top', "-" + _this.window_offset + "px");
      _this.main_content.css('position', 'fixed');
      _this.setState('left--opening');
      return window.scrollTo(0, 0);
    };

    FrameworkOffCanvas.prototype.openLeftComplete = function() {
      var _this;
      _this = this;
      _this.setFocus('left-sidebar');
      return _this.left_sidebar.find('.disclosure--root').trigger('update_form_position');
    };

    FrameworkOffCanvas.prototype.openRight = function() {
      var _this;
      _this = this;
      _this.root.css('overflow', 'hidden');
      _this.right_sidebar.css('display', 'block');
      _this.window_offset = window.pageYOffset;
      _this.main_content.css('top', "-" + _this.window_offset + "px");
      _this.main_content.css('position', 'fixed');
      _this.setState('right--opening');
      return window.scrollTo(0, 0);
    };

    FrameworkOffCanvas.prototype.openRightComplete = function() {
      var _this;
      _this = this;
      _this.setFocus('right-sidebar');
      return _this.right_sidebar.find('.disclosure--root').trigger('update_form_position');
    };

    FrameworkOffCanvas.prototype.closeLeft = function() {
      var _this;
      _this = this;
      _this.setState('left--closing');
      return _this.last_trigger.focus();
    };

    FrameworkOffCanvas.prototype.closeLeftComplete = function() {
      var _this;
      _this = this;
      _this.root.css('overflow', 'unset');
      _this.left_sidebar.css('display', 'none');
      _this.main_content.css('position', 'relative');
      _this.main_content.css('top', 'initial');
      return window.scrollTo(0, _this.window_offset);
    };

    FrameworkOffCanvas.prototype.closeRight = function() {
      var _this;
      _this = this;
      _this.setState('right--closing');
      return _this.last_trigger.focus();
    };

    FrameworkOffCanvas.prototype.closeRightComplete = function() {
      var _this;
      _this = this;
      _this.root.css('overflow', 'unset');
      _this.right_sidebar.css('display', 'none');
      _this.main_content.css('position', 'relative');
      _this.main_content.css('top', 'initial');
      return window.scrollTo(0, _this.window_offset);
    };

    FrameworkOffCanvas.prototype.setFocus = function(element) {
      var _this, current_view, focusable_elements;
      _this = this;
      if (element === 'right-sidebar') {
        current_view = _this.right_sidebar.find("[data-view='" + _this.right_sidebar_view + "']");
      } else if (element = 'left-sidebar') {
        current_view = _this.left_sidebar.find("[data-view='menu']");
      }
      focusable_elements = theme.utils.getFocusableEl(current_view);
      if (focusable_elements) {
        return focusable_elements.focus(0);
      }
    };

    FrameworkOffCanvas.prototype.touchListener = function() {
      var _this;
      _this = this;
      if (!theme.utils.isTouchDevice()) {
        return;
      }
      el(document).on('theme:swipe:left', function() {
        if (_this.state === 'left--opened') {
          return _this.closeLeft();
        }
      });
      return el(document).on('theme:swipe:right', function() {
        if (_this.state === 'right--opened') {
          return _this.closeRight();
        }
      });
    };

    FrameworkOffCanvas.prototype.transitionListeners = function() {
      var _this;
      _this = this;
      _this.overlay.on('transition:at_start', function() {
        if (_this.state === 'left--closing') {
          _this.setState('closed');
          _this.closeLeftComplete();
        }
        if (_this.state === 'right--closing') {
          _this.setState('closed');
          return _this.closeRightComplete();
        }
      });
      return _this.overlay.on('transition:at_end', function() {
        if (_this.state === 'left--opening') {
          _this.setState('left--opened');
          _this.openLeftComplete();
        }
        if (_this.state === 'right--opening') {
          _this.setState('right--opened');
          return _this.openRightComplete();
        }
      });
    };

    return FrameworkOffCanvas;

  })();

  theme.classes.FrameworkPasswordPage = (function() {
    function FrameworkPasswordPage(root) {
      var _this;
      this.root = root;
      this.cancelLoginListener = bind(this.cancelLoginListener, this);
      this.loginFormListener = bind(this.loginFormListener, this);
      this.load = bind(this.load, this);
      _this = this;
      _this.login_form = _this.root.find('.password--login-form');
      _this.login_cancel = _this.root.find('.password--cancel');
      _this.login_link = _this.root.find('.password--login-link');
      _this.signup_form = _this.root.find('.password--main > *');
      _this.load();
    }

    FrameworkPasswordPage.prototype.load = function() {
      var _this;
      _this = this;
      _this.loginFormListener();
      return _this.cancelLoginListener();
    };

    FrameworkPasswordPage.prototype.loginFormListener = function() {
      var _this;
      _this = this;
      return _this.login_link.on('click keydown', function(event) {
        event.preventDefault();
        if (event.type === 'keydown' && event.key !== 'Enter') {
          return;
        }
        el(this).css('visibility', 'hidden');
        _this.signup_form.hide();
        _this.login_form.css('visibility', 'visible');
        return _this.login_form.find('input[type="password"]').focus();
      });
    };

    FrameworkPasswordPage.prototype.cancelLoginListener = function() {
      var _this;
      _this = this;
      return _this.login_cancel.on('click keydown', function(event) {
        if (event.type === 'keydown' && event.key !== 'Enter') {
          return;
        }
        _this.signup_form.show();
        _this.login_form.css('visibility', 'hidden');
        return _this.login_link.css('visibility', 'visible');
      });
    };

    return FrameworkPasswordPage;

  })();

  theme.classes.FrameworkProductModel = (function() {
    function FrameworkProductModel(root) {
      var _this;
      this.root = root;
      this.loadModel = bind(this.loadModel, this);
      this.loadAssets = bind(this.loadAssets, this);
      this.eventListeners = bind(this.eventListeners, this);
      this.load = bind(this.load, this);
      _this = this;
      _this.view = _this.root.data('view');
      _this.key = _this.root.closest('[data-id]').data('id');
      _this.cdn = 'https://cdn.shopify.com/shopifycloud/model-viewer-ui/assets/v1.0/model-viewer-ui';
      _this.xr_cdn = 'https://cdn.shopify.com/shopifycloud/shopify-xr-js/assets/v1.0/shopify-xr.en.js';
      _this.load();
    }

    FrameworkProductModel.prototype.load = function() {
      var _this;
      _this = this;
      _this.eventListeners();
      if (theme.utils.modelAssetsAdded) {
        return;
      }
      theme.utils.modelAssetsAdded = true;
      return _this.loadAssets();
    };

    FrameworkProductModel.prototype.eventListeners = function() {
      var _this;
      _this = this;
      _this.root.on('model-ready', function() {
        return _this.loadModel();
      });
      _this.root.on('theme:section:load', function() {
        return _this.loadModel();
      });
      _this.root.on('pause-media', function() {
        if (_this.model) {
          return _this.model.pause();
        }
      });
      _this.root.on('play-media', function() {
        if (_this.model) {
          return _this.model.play();
        }
      });
      return theme.window.on('resize.ProductModel', theme.utils.debounce(250, function() {
        el('.product-model--root').trigger('pause-media');
        return el('.product-model--root').trigger('model-ready');
      }));
    };

    FrameworkProductModel.prototype.loadAssets = function() {
      var _this;
      _this = this;
      theme.utils.insertStylesheet(_this.cdn + ".css");
      theme.utils.insertScript(_this.xr_cdn);
      return theme.utils.insertScript(_this.cdn + ".en.js", function() {
        return el('.product-model--root').trigger('model-ready');
      });
    };

    FrameworkProductModel.prototype.loadModel = function() {
      var _this;
      _this = this;
      if (_this.model) {
        return;
      }
      if (theme.utils.mqs.current_window === 'small' && _this.view === 'desktop') {
        return;
      } else if (theme.utils.mqs.current_window !== 'small' && _this.view === 'mobile') {
        return;
      }
      if (typeof Shopify !== 'undefined') {
        return _this.model = new Shopify.ModelViewerUI(_this.root.find('model-viewer').el[0]);
      }
    };

    return FrameworkProductModel;

  })();

  theme.classes.FrameworkProductRecommendations = (function() {
    function FrameworkProductRecommendations(root) {
      var _this, max_products, product_id;
      this.root = root;
      this.resizeListeners = bind(this.resizeListeners, this);
      this.loadHoverImages = bind(this.loadHoverImages, this);
      this.initProductItems = bind(this.initProductItems, this);
      this.matchImageHeights = bind(this.matchImageHeights, this);
      this.load = bind(this.load, this);
      _this = this;
      product_id = _this.root.attr('data-product-id');
      max_products = _this.root.attr('data-max-products');
      _this.request_url = theme.urls.product_recommendations + "?section_id=framework--product-recommendations&limit=" + max_products + "&product_id=" + product_id;
      _this.load();
    }

    FrameworkProductRecommendations.prototype.load = function() {
      var _this, request;
      _this = this;
      request = new XMLHttpRequest();
      request.onload = function() {
        var html, number_of_products;
        if (request.status >= 200 && request.status < 300) {
          html = theme.utils.parseHtml(request.response, '.product-recommendations--container');
          _this.root.append(html);
          number_of_products = _this.root.find('.product--root').length;
          if (!number_of_products) {
            _this.root.hide();
            return;
          }
          _this.matchImageHeights();
          _this.initProductItems();
          _this.loadHoverImages();
          return _this.resizeListeners();
        }
      };
      request.onerror = function() {
        return console.log(request.statusText + ": recommendation HTML request failed!");
      };
      request.open("GET", _this.request_url);
      return request.send();
    };

    FrameworkProductRecommendations.prototype.matchImageHeights = function() {
      var _this, item_container, items;
      _this = this;
      item_container = _this.root.find('.product-recommendations--body');
      items = _this.root.find('.product--root');
      return theme.utils.matchImageHeights(item_container, items, '.product--image-wrapper');
    };

    FrameworkProductRecommendations.prototype.initProductItems = function() {
      var _this;
      _this = this;
      if (theme.settings.quick_add) {
        theme.partials.OffCanvas.unload();
        theme.partials.OffCanvas.load();
      }
      return theme.utils.loadJsClasses(_this.root);
    };

    FrameworkProductRecommendations.prototype.loadHoverImages = function() {
      var _this;
      _this = this;
      return _this.root.find('.product--hover-image').each(function(hover_image) {
        hover_image = el(hover_image);
        return theme.utils.imagesLoaded(hover_image, function() {
          var product;
          product = hover_image.closest('[data-hover-image="true"]');
          return product.attr('data-hover-image', 'loaded');
        });
      });
    };

    FrameworkProductRecommendations.prototype.resizeListeners = function() {
      var _this;
      _this = this;
      return theme.window.on('resize.ProductRecommendations', theme.utils.debounce(100, function() {
        return _this.matchImageHeights();
      }));
    };

    return FrameworkProductRecommendations;

  })();

  theme.classes.FrameworkProductVideo = (function() {
    function FrameworkProductVideo(root) {
      var _this;
      this.root = root;
      this.skipVideo = bind(this.skipVideo, this);
      this.loadYoutubeVideo = bind(this.loadYoutubeVideo, this);
      this.loadPlyrVideo = bind(this.loadPlyrVideo, this);
      this.loadYoutubeAsset = bind(this.loadYoutubeAsset, this);
      this.loadPlyrAssets = bind(this.loadPlyrAssets, this);
      this.resizeListener = bind(this.resizeListener, this);
      this.youtubeListeners = bind(this.youtubeListeners, this);
      this.plyrListeners = bind(this.plyrListeners, this);
      this.load = bind(this.load, this);
      _this = this;
      _this.view = _this.root.data('view');
      _this.type = _this.root.data('type');
      _this.loop_enabled = _this.root.data('loop-enabled');
      _this.load();
    }

    FrameworkProductVideo.prototype.load = function() {
      var _this;
      _this = this;
      _this.resizeListener();
      if (_this.type === 'youtube') {
        _this.id = _this.root.find('.product-video').attr('id');
        _this.video_id = _this.root.data('video-id');
        _this.youtubeListeners();
        return _this.loadYoutubeAsset();
      } else {
        _this.plyr_cdn = 'https://cdn.shopify.com/shopifycloud/shopify-plyr/v1.0/shopify-plyr';
        _this.plyrListeners();
        return _this.loadPlyrAssets();
      }
    };

    FrameworkProductVideo.prototype.plyrListeners = function() {
      var _this;
      _this = this;
      _this.root.on('plyr-video-ready', function() {
        return _this.loadPlyrVideo();
      });
      _this.root.on('theme:section:load', function() {
        return _this.loadPlyrVideo();
      });
      _this.root.on('pause-media', function() {
        if (_this.video) {
          return _this.video.pause();
        }
      });
      return _this.root.on('play-media', function() {
        if (_this.video) {
          return _this.video.play();
        }
      });
    };

    FrameworkProductVideo.prototype.youtubeListeners = function() {
      var _this;
      _this = this;
      window.addEventListener('theme:utils:youtubeAPIReady', function() {
        return _this.loadYoutubeVideo();
      });
      return _this.root.on('theme:section:load', function() {
        return _this.loadYoutubeVideo();
      });
    };

    FrameworkProductVideo.prototype.resizeListener = function() {
      var _this;
      _this = this;
      return theme.window.on('resize.ProductVideo', theme.utils.debounce(250, function() {
        el('.product-video--root').trigger('pause-media');
        el('.product-video--root').trigger('plyr-video-ready');
        return el('.product-video--root').trigger('theme:utils:youtubeAPIReady');
      }));
    };

    FrameworkProductVideo.prototype.loadPlyrAssets = function() {
      var _this;
      _this = this;
      if (theme.utils.plyrScriptAdded) {
        return;
      }
      theme.utils.plyrScriptAdded = true;
      theme.utils.insertStylesheet(_this.plyr_cdn + ".css");
      return theme.utils.insertScript(_this.plyr_cdn + ".en.js", function() {
        return el('.product-video--root').trigger('plyr-video-ready');
      });
    };

    FrameworkProductVideo.prototype.loadYoutubeAsset = function() {
      var _this;
      _this = this;
      if (theme.utils.youtube_script_added) {
        return;
      }
      theme.utils.youtube_script_added = true;
      return theme.utils.insertScript('https://www.youtube.com/iframe_api');
    };

    FrameworkProductVideo.prototype.loadPlyrVideo = function() {
      var _this;
      _this = this;
      if (_this.video) {
        return;
      }
      if (_this.skipVideo()) {
        return;
      }
      if (typeof Shopify !== 'undefined') {
        return _this.video = new Shopify.Plyr(_this.root.find('video').el[0], {
          iconUrl: _this.plyr_cdn + ".svg",
          loop: {
            active: _this.loop_enabled
          }
        });
      }
    };

    FrameworkProductVideo.prototype.loadYoutubeVideo = function() {
      var _this;
      _this = this;
      if (_this.video) {
        return;
      }
      if (_this.skipVideo()) {
        return;
      }
      if (typeof YT !== 'undefined') {
        return _this.video = new YT.Player(_this.id, {
          videoId: _this.video_id,
          events: {
            onReady: function(event) {
              _this.root.on('pause-media', function() {
                return event.target.pauseVideo();
              });
              return _this.root.on('play-media', function() {
                return event.target.playVideo();
              });
            },
            onStateChange: function(event) {
              if (event.data === 0 && _this.loop_enabled) {
                event.target.seekTo(0);
              }
              if (event.data === 1) {
                return el('.product-media--featured > *').not(_this.root).trigger('pause-media');
              }
            }
          }
        });
      }
    };

    FrameworkProductVideo.prototype.skipVideo = function() {
      var _this;
      _this = this;
      if (theme.utils.mqs.current_window === 'small' && _this.view === 'desktop') {
        return true;
      } else if (theme.utils.mqs.current_window !== 'small' && _this.view === 'mobile') {
        return true;
      } else {
        return false;
      }
    };

    return FrameworkProductVideo;

  })();

  theme.classes.FrameworkProduct = (function() {
    function FrameworkProduct(root) {
      var _this;
      this.root = root;
      this.updateRecentList = bind(this.updateRecentList, this);
      this.thumbNavigation = bind(this.thumbNavigation, this);
      this.initZoomListener = bind(this.initZoomListener, this);
      this.getActiveImageId = bind(this.getActiveImageId, this);
      this.imageZoom = bind(this.imageZoom, this);
      this.updateVariantMedia = bind(this.updateVariantMedia, this);
      this.addProductComplete = bind(this.addProductComplete, this);
      this.addToCartListener = bind(this.addToCartListener, this);
      this.updatePrices = bind(this.updatePrices, this);
      this.enableStockForm = bind(this.enableStockForm, this);
      this.enableCartButtons = bind(this.enableCartButtons, this);
      this.variantSelected = bind(this.variantSelected, this);
      this.updateHistoryState = bind(this.updateHistoryState, this);
      this.updateVariant = bind(this.updateVariant, this);
      this.optionChangeListener = bind(this.optionChangeListener, this);
      this.updateLowInStock = bind(this.updateLowInStock, this);
      this.sizeChart = bind(this.sizeChart, this);
      this.updatePickup = bind(this.updatePickup, this);
      this.getProductJson = bind(this.getProductJson, this);
      this.load = bind(this.load, this);
      _this = this;
      _this.form_root = _this.root.find('.product-form--root');
      _this.thumbs_root = _this.root.find('.product-media--root[data-view="thumbs"]');
      _this.featured_root = _this.root.find('.product-media--root[data-view="featured"]').not('[data-media-size="mobile"]');
      if (_this.featured_root) {
        _this.magnify = _this.featured_root.data('magnify');
        _this.main_media = _this.featured_root.find('.product-media--featured');
        _this.media_container = _this.featured_root.closest('.product-media--wrapper');
        _this.model_buttons = _this.root.find('[data-shopify-xr]');
        _this.thumbs = _this.thumbs_root.find('.product-media--thumb');
        _this.zoom_enabled = _this.featured_root.data('zoom-enabled');
        _this.zoom_images = _this.featured_root.find('.product-media--zoom-image');
      }
      _this.add_to_cart_button = _this.form_root.find('.product-form--add-to-cart');
      _this.button_container = _this.form_root.find('.product-form--button-container');
      _this.button_text_container = _this.form_root.find('.product-form--text');
      _this.callback_enabled = _this.form_root.data('callback-enabled');
      _this.compare_price = _this.form_root.find('.product-form--compare-price');
      _this.form = _this.form_root.find('.product-form--container');
      _this.handle = _this.form_root.attr('data-handle');
      _this.is_only_variant = _this.form_root.data('is-only-variant');
      _this.low_stock_container = _this.form_root.find(".product-form--low-stock");
      _this.low_stock_threshold = _this.form_root.data('low-stock-amount');
      _this.pickup_enabled = _this.form_root.data('pickup-enabled');
      _this.pickup_drawer_container = el('.off-canvas--container[data-view="pickup"]');
      _this.pickup_form_container = _this.root.find('.product-form--pickup');
      _this.pickup_form_spinner = _this.root.find('.product-form--pickup--spinner');
      _this.price = _this.form_root.find('.product-form--price');
      _this.price_container = _this.form_root.find('.product-form--price-container');
      _this.product_title = _this.form_root.attr('data-title');
      _this.reference_unit = _this.form_root.find('.product-form--reference-unit');
      _this.reference_value = _this.form_root.find('.product-form--reference-value');
      _this.show_low_in_stock = _this.low_stock_threshold === void 0 ? false : true;
      _this.size_chart_enabled = _this.form_root.data('size-chart-enabled');
      _this.size_chart_option = _this.form_root.attr('data-size-chart-option');
      _this.smart_payment_buttons = _this.form_root.find('.product-form--smart-payment-buttons');
      _this.sold_out = _this.form_root.data('sold-out');
      _this.unavailable_container = _this.form_root.find('.product-form--unavailable');
      _this.unavailable_button = _this.unavailable_container.find('button');
      _this.unit_price_container = _this.form_root.find('.product-form--unit-price-container');
      _this.unit_price = _this.form_root.find('.product-form--unit-price');
      _this.variant_container = _this.form_root.find('.product-form--variants');
      _this.variant_listbox = _this.form_root.find('.product-form--variant-select');
      _this.first_variant_available = _this.variant_listbox.find('[selected]').data('available');
      _this.first_variant_id = parseInt(_this.variant_listbox.find('[selected]').val());
      _this.first_variant_inventory = _this.variant_listbox.find('[selected]').data('inventory');
      _this.option_inputs = _this.variant_container.find('[data-item="disclosure"], [data-item="radio"]');
      _this.load();
    }

    FrameworkProduct.prototype.load = function() {
      var _this;
      _this = this;
      if (!_this.sold_out) {
        if (_this.handle) {
          _this.getProductJson();
        }
        if (_this.pickup_enabled && _this.first_variant_inventory && _this.first_variant_available) {
          _this.updatePickup(_this.first_variant_id);
        }
        if (_this.show_low_in_stock) {
          _this.updateLowInStock(_this.first_variant_id);
        }
        if (theme.settings.cart_type === 'drawer') {
          _this.addToCartListener();
        }
      }
      if (_this.zoom_enabled) {
        _this.initZoomListener();
      }
      if (_this.thumbs) {
        _this.thumbNavigation();
      }
      if (_this.handle) {
        return _this.updateRecentList();
      }
    };

    FrameworkProduct.prototype.getProductJson = function() {
      var _this, request;
      _this = this;
      request = new XMLHttpRequest();
      request.onload = function() {
        var product_json;
        if (request.status >= 200 && request.status < 300) {
          product_json = JSON.parse(request.response);
          if (product_json.variants.length > 1) {
            _this.optionChangeListener(product_json.variants);
            if (_this.size_chart_enabled) {
              return _this.sizeChart(product_json.options);
            }
          }
        }
      };
      request.onerror = function() {
        return console.log(request.statusText + ": product.json request failed!");
      };
      request.open("GET", theme.urls.root + "/products/" + _this.handle + ".js");
      return request.send();
    };

    FrameworkProduct.prototype.updatePickup = function(variant_id) {
      var _this, request;
      _this = this;
      _this.pickup_form_spinner.show();
      _this.pickup_form_container.hide();
      request = new XMLHttpRequest();
      request.onload = function() {
        var drawer_el, form_el;
        if (request.status >= 200 && request.status < 300) {
          form_el = theme.utils.parseHtml(request.response, '.pickup--form--container');
          _this.pickup_form_container.empty().append(form_el);
          _this.pickup_form_spinner.hide();
          _this.pickup_form_container.show();
          drawer_el = theme.utils.parseHtml(request.response, '.pickup--drawer--container');
          if (drawer_el.length) {
            drawer_el.find('.pickup--drawer--product-title').text(_this.product_title);
            if (_this.is_only_variant) {
              drawer_el.find('.pickup--drawer--variant-title').hide();
            }
            _this.pickup_drawer_container.empty().append(drawer_el);
          }
          theme.partials.OffCanvas.unload();
          return theme.partials.OffCanvas.load();
        }
      };
      request.onerror = function() {
        return console.log(request.statusText + ": product pickup request failed!");
      };
      request.open("GET", theme.urls.root + "/variants/" + variant_id + "/?section_id=framework--pickup");
      return request.send();
    };

    FrameworkProduct.prototype.sizeChart = function(options) {
      var _this;
      _this = this;
      _this.form_root.find('.disclosure--root, .radios--header').each(function(input, index) {
        var size_chart_el;
        if (options[index].name.toLowerCase() === _this.size_chart_option.toLowerCase()) {
          size_chart_el = theme.utils.parseHtml("<div class='product-form--modal-link' data-item='block-link'> <a class='modal--link' href='#'> " + theme.translations.size_chart_label + " </a> </div>", '.product-form--modal-link');
          el(input).append(size_chart_el);
          return false;
        }
      });
      return new theme.classes.FrameworkModal(_this.form_root.find('[data-js-class="FrameworkModal"]'));
    };

    FrameworkProduct.prototype.updateLowInStock = function(variant_id) {
      var _this, message, quantity;
      _this = this;
      quantity = _this.variant_listbox.find("[value='" + variant_id + "']").data('inventory-quantity');
      if (!quantity) {
        return;
      } else if (quantity === 1) {
        message = theme.translations.low_in_stock.one;
      } else if (quantity > 1) {
        message = theme.translations.low_in_stock.other;
        message = message.replace(/\d+/, quantity);
      }
      return _this.low_stock_container.text(message).show();
    };

    FrameworkProduct.prototype.optionChangeListener = function(variants) {
      var _this;
      _this = this;
      return _this.option_inputs.on('change', function() {
        var current_options, j, len, options, variant, variant_found;
        current_options = _this.variant_container.find('[data-item="disclosure"], [data-item="radio"]:checked');
        options = [];
        current_options.each(function(current_option) {
          return options.push(el(current_option).val().trim());
        });
        for (j = 0, len = variants.length; j < len; j++) {
          variant = variants[j];
          variant_found = variant.options.every(function(variant_option) {
            return options.includes(variant_option);
          });
          if (variant_found) {
            _this.updateVariant(variant);
            return;
          }
        }
        return _this.updateVariant(false);
      });
    };

    FrameworkProduct.prototype.updateVariant = function(variant) {
      var _this;
      _this = this;
      if (_this.callback_enabled) {
        _this.updateHistoryState(variant.id);
        return selectCallback(variant);
      } else {
        return _this.variantSelected(variant);
      }
    };

    FrameworkProduct.prototype.updateHistoryState = function(variant_id) {
      var _this, new_variant_url;
      _this = this;
      new_variant_url = "" + location.origin + location.pathname;
      if (variant_id) {
        new_variant_url += "?variant=" + variant_id;
      }
      return history.replaceState({
        path: new_variant_url
      }, '', new_variant_url);
    };

    FrameworkProduct.prototype.variantSelected = function(variant) {
      var _this;
      _this = this;
      _this.form.find('.product-form--error').remove();
      _this.low_stock_container.hide();
      _this.variant_listbox.find('option[selected]').removeAttr('selected');
      _this.updatePrices(variant);
      if (variant && variant.available) {
        _this.variant_listbox.find("option[value='" + variant.id + "']").attr('selected', '');
        _this.enableCartButtons(true, true);
        _this.enableStockForm(false);
        if (_this.show_low_in_stock) {
          _this.updateLowInStock(variant.id);
        }
        if (_this.pickup_enabled && variant.inventory_management) {
          _this.updatePickup(variant.id);
        }
      } else if (variant && !variant.available) {
        _this.variant_listbox.find("option[value='" + variant.id + "']").attr('selected', '');
        _this.enableCartButtons(false, true);
        _this.enableStockForm(true);
      } else {
        _this.enableCartButtons(false, false);
        _this.enableStockForm(false);
      }
      if (_this.pickup_enabled && !variant.available) {
        _this.pickup_form_container.hide();
      }
      if (variant.featured_media) {
        return _this.updateVariantMedia(variant.featured_media.id);
      }
    };

    FrameworkProduct.prototype.enableCartButtons = function(enable, available) {
      var _this;
      _this = this;
      if (enable) {
        _this.add_to_cart_button.removeAttr('disabled');
        _this.button_text_container.text(theme.translations.add_to_cart);
        return _this.smart_payment_buttons.removeAttr('style');
      } else {
        _this.add_to_cart_button.attr('disabled', true);
        _this.smart_payment_buttons.hide();
        if (available) {
          return _this.button_text_container.text(theme.translations.out_of_stock);
        } else {
          return _this.button_text_container.text(theme.translations.unavailable);
        }
      }
    };

    FrameworkProduct.prototype.enableStockForm = function(enable) {
      var _this;
      _this = this;
      if (enable) {
        _this.unavailable_button.removeAttr("disabled");
        return _this.unavailable_container.show();
      } else {
        _this.unavailable_button.attr("disabled", true);
        return _this.unavailable_container.hide();
      }
    };

    FrameworkProduct.prototype.updatePrices = function(variant) {
      var _this, compare_price, unit_price, variant_price;
      _this = this;
      if (!variant) {
        _this.price_container.hide();
        return;
      } else {
        _this.price_container.removeAttr('style');
      }
      variant_price = theme.utils.formatMoney(variant.price);
      _this.price.html(variant_price);
      if (variant.compare_at_price > variant.price) {
        compare_price = theme.utils.formatMoney(variant.compare_at_price);
        _this.compare_price.html(compare_price);
        _this.compare_price.attr('style', 'display:inline-block;');
      } else {
        _this.compare_price.hide();
      }
      if (variant.unit_price_measurement) {
        unit_price = theme.utils.formatMoney(variant.unit_price);
        _this.unit_price.html(unit_price);
        _this.reference_unit.html(variant.unit_price_measurement.reference_unit);
        if (variant.unit_price_measurement.reference_value === 1) {
          _this.reference_value.hide();
        } else {
          _this.reference_value.html(variant.unit_price_measurement.reference_value);
          _this.reference_value.show();
        }
        return _this.unit_price_container.attr('style', 'display:flex;');
      } else {
        return _this.unit_price_container.hide();
      }
    };

    FrameworkProduct.prototype.addToCartListener = function() {
      var _this;
      _this = this;
      if (_this.form.length > 0 && theme.settings.cart_type === 'drawer') {
        return _this.form.on('submit', function(event) {
          _this.form.find('.product-form--error').remove();
          _this.button_container.attr('data-loading', 'true');
          theme.partials.Cart.addItem(el(this), function(success, error) {
            var product_error_el;
            if (success) {
              return theme.partials.Cart.updateAllHtml(function() {
                return _this.addProductComplete();
              });
            } else {
              product_error_el = theme.utils.parseHtml("<div class='product-form--error' data-item='small-text'> " + error + " </div>", '.product-form--error');
              return _this.button_container.insertBefore(product_error_el).attr('data-loading', 'false');
            }
          });
          event.preventDefault();
          return event.stopPropagation();
        });
      }
    };

    FrameworkProduct.prototype.addProductComplete = function() {
      var _this;
      _this = this;
      _this.button_container.attr('data-loading', 'false');
      el('.off-canvas--right-sidebar').attr('data-active', 'cart');
      if (theme.partials.OffCanvas.state === 'closed') {
        theme.partials.OffCanvas.right_sidebar_view = 'cart';
        theme.partials.OffCanvas.openRight();
        return theme.partials.OffCanvas.last_trigger = _this.add_to_cart_button;
      }
    };

    FrameworkProduct.prototype.updateVariantMedia = function(variant_media_id) {
      var _this, variant_button, variant_image, variant_thumb;
      _this = this;
      _this.main_media.attr('data-active', 'false');
      _this.main_media.parent().hide();
      variant_image = _this.main_media.filter("[data-id='" + variant_media_id + "']");
      variant_image.attr('data-active', 'true');
      variant_image.parent().show();
      _this.thumbs.attr('data-active', 'false');
      variant_thumb = _this.thumbs.filter("[data-id='" + variant_media_id + "']");
      variant_thumb.attr('data-active', 'true');
      _this.model_buttons.attr('data-active', 'false');
      variant_button = _this.model_buttons.filter("[data-shopify-model3d-id='" + variant_media_id + "']");
      variant_button.attr('data-active', 'true');
      if (_this.zoom_enabled) {
        return _this.imageZoom();
      }
    };

    FrameworkProduct.prototype.imageZoom = function() {
      var _this, active_zoom_image, left_position, magnified_height, magnified_width, top_position, wrapper_height, wrapper_width, x_ratio, y_ratio;
      _this = this;
      active_zoom_image = _this.zoom_images.filter("[data-id='" + (_this.getActiveImageId()) + "']");
      active_zoom_image.css('display', 'none');
      _this.media_container.off('mouseenter.Product.ImageZoom mouseleave.Product.ImageZoom');
      if (_this.main_media.length < 1 || theme.utils.mqs.current_window === 'small') {

      } else if (active_zoom_image.length > 0) {
        _this.media_container.attr('data-media-type', 'image');
        wrapper_width = _this.media_container.width();
        wrapper_height = _this.media_container.height();
        magnified_width = wrapper_width * _this.magnify;
        magnified_height = wrapper_height * _this.magnify;
        left_position = _this.media_container.offset().left;
        top_position = _this.media_container.offset().top;
        active_zoom_image.css('width', magnified_width + "px");
        active_zoom_image.find('.image--root').css('width', magnified_width + "px");
        active_zoom_image.find('img').addClass('lazypreload');
        x_ratio = (magnified_width - wrapper_width) / wrapper_width;
        y_ratio = (magnified_height - wrapper_height) / wrapper_height;
        _this.media_container.on('mouseenter.Product.ImageZoom', function() {
          return active_zoom_image.css('display', 'block');
        });
        _this.media_container.on('mouseleave.Product.ImageZoom', function() {
          return active_zoom_image.css('display', 'none');
        });
        return _this.media_container.on('mousemove', function(event) {
          var relative_left, relative_top;
          relative_left = event.pageX - left_position;
          relative_top = event.pageY - top_position;
          active_zoom_image.css('left', (relative_left * -x_ratio) + "px");
          return active_zoom_image.css('top', (relative_top * -y_ratio) + "px");
        });
      } else {
        return _this.media_container.attr('data-media-type', '');
      }
    };

    FrameworkProduct.prototype.getActiveImageId = function() {
      var _this, active_image, active_image_id;
      _this = this;
      active_image = _this.main_media.filter('[data-active="true"]');
      return active_image_id = active_image.attr('data-id');
    };

    FrameworkProduct.prototype.initZoomListener = function() {
      var _this;
      _this = this;
      return theme.window.on('resize.Product', theme.utils.debounce(100, function() {
        return _this.imageZoom();
      }));
    };

    FrameworkProduct.prototype.thumbNavigation = function() {
      var _this;
      _this = this;
      return _this.thumbs.on('keypress click', function(event) {
        var clicked_id, clicked_media, current_media;
        if (theme.utils.a11yClick(event)) {
          current_media = _this.root.find('.product-media--featured[data-active="true"] > *');
          current_media.trigger('pause-media');
          clicked_id = el(this).attr('data-id');
          clicked_media = _this.root.find(".product-media--featured[data-id='" + clicked_id + "'] > *");
          _this.updateVariantMedia(clicked_id);
          if (theme.utils.mqs.current_window !== 'small') {
            clicked_media.trigger('play-media');
          }
          if (clicked_media.parent().attr('data-media-type') !== 'image') {
            return clicked_media.focus();
          }
        }
      });
    };

    FrameworkProduct.prototype.updateRecentList = function() {
      var _this, current_product_arr, current_product_str, max_num_recents_stored, newly_visited_product, previous_product_arr, previous_product_str;
      _this = this;
      current_product_arr = [_this.handle];
      previous_product_str = localStorage.getItem(theme.local_storage.recent_products);
      max_num_recents_stored = 4;
      if (previous_product_str) {
        previous_product_arr = JSON.parse(previous_product_str);
        if (previous_product_arr.indexOf(_this.handle) === -1) {
          newly_visited_product = true;
        }
      } else {
        current_product_str = JSON.stringify(current_product_arr);
        localStorage.setItem(theme.local_storage.recent_products, current_product_str);
      }
      if (newly_visited_product) {
        if (previous_product_arr.length === max_num_recents_stored) {
          previous_product_arr = previous_product_arr.slice(1);
        }
        current_product_str = JSON.stringify(previous_product_arr.concat(current_product_arr));
        return localStorage.setItem(theme.local_storage.recent_products, current_product_str);
      }
    };

    FrameworkProduct.initQuickAddForm = function(quick_add_button) {
      var existing_product_form, new_product_form, product_id;
      el('.off-canvas--right-sidebar').find('.product--form').hide();
      product_id = quick_add_button.attr('data-product-id');
      existing_product_form = el('.off-canvas--right-sidebar').find("[data-product-id='" + product_id + "']");
      if (existing_product_form.length > 0) {
        existing_product_form.show();
        return theme.partials["Product-" + product_id].updateRecentList();
      } else {
        new_product_form = quick_add_button.closest('.product--root').find('.product--form');
        theme.partials["Product-" + product_id] = new theme.classes.Product(new_product_form);
        return el('[data-view="product-form"]').append(new_product_form);
      }
    };

    FrameworkProduct.quickAddToCart = function(quick_add_button) {
      var product_root;
      quick_add_button.attr('data-loading', true);
      product_root = quick_add_button.closest('.product--root');
      product_root.find('.product--error').remove();
      return theme.partials.Cart.addItem(product_root.find('.product-form--container'), function(success, error) {
        var product_error_el;
        if (success) {
          theme.partials.Cart.updateAllHtml(function() {
            quick_add_button.attr('data-loading', false);
            if (theme.partials.OffCanvas.state === 'closed') {
              return theme.partials.OffCanvas.openRight();
            }
          });
        } else {
          product_error_el = theme.utils.parseHtml("<div class='product--error' data-item='small-text'> " + error + " </div>", '.product--error');
          product_root.find('.product--details-container').append(product_error_el);
          quick_add_button.attr('data-loading', false);
        }
        return theme.window.trigger('resize');
      });
    };

    return FrameworkProduct;

  })();

  theme.classes.FrameworkRadios = (function() {
    function FrameworkRadios(root) {
      var _this;
      this.root = root;
      this.setSwatchAppearance = bind(this.setSwatchAppearance, this);
      this.updateLabelOnChange = bind(this.updateLabelOnChange, this);
      this.preventFormSubmitOnEnter = bind(this.preventFormSubmitOnEnter, this);
      this.load = bind(this.load, this);
      _this = this;
      _this.current_value = _this.root.find('.radios--option-current');
      _this.inputs = _this.root.find('[data-item="radio"]');
      _this.is_swatches = _this.root.data('is-swatches');
      _this.load();
    }

    FrameworkRadios.prototype.load = function() {
      var _this;
      _this = this;
      _this.preventFormSubmitOnEnter();
      if (_this.is_swatches) {
        _this.updateLabelOnChange();
        return _this.setSwatchAppearance();
      }
    };

    FrameworkRadios.prototype.preventFormSubmitOnEnter = function() {
      var _this;
      _this = this;
      return _this.inputs.on('keydown', function(event) {
        if (event.key === 'Enter') {
          return event.preventDefault();
        }
      });
    };

    FrameworkRadios.prototype.updateLabelOnChange = function() {
      var _this;
      _this = this;
      return _this.inputs.on('change', function() {
        return _this.current_value.text(el(this).val());
      });
    };

    FrameworkRadios.prototype.setSwatchAppearance = function() {
      var _this;
      _this = this;
      return _this.inputs.each(function(input) {
        var swatch, swatch_color;
        swatch = el(input).siblings('.radios--swatch-button');
        swatch_color = el(input).val().toLowerCase().replace(/\s+/g, '');
        if (theme.swatches[swatch_color] === void 0) {
          return swatch.css('background-color', swatch_color);
        } else if (theme.swatches[swatch_color].indexOf('cdn.shopify.com') > -1) {
          return swatch.css('background-image', "url(" + theme.swatches[swatch_color] + ")");
        } else {
          return swatch.css('background-color', theme.swatches[swatch_color]);
        }
      });
    };

    return FrameworkRadios;

  })();

  theme.classes.FrameworkRecentProducts = (function() {
    function FrameworkRecentProducts(root) {
      var _this;
      this.root = root;
      this.hoverImagesLoaded = bind(this.hoverImagesLoaded, this);
      this.matchImageHeights = bind(this.matchImageHeights, this);
      this.resizeListeners = bind(this.resizeListeners, this);
      this.formatProducts = bind(this.formatProducts, this);
      this.checkIfAllProductsLoaded = bind(this.checkIfAllProductsLoaded, this);
      this.renderProductItem = bind(this.renderProductItem, this);
      this.load = bind(this.load, this);
      _this = this;
      _this.main_grid = _this.root.find('.collection--recent-products--grid');
      _this.num_errors = 0;
      _this.num_loaded = 0;
      _this.spinner = _this.root.find('.collection--recent-products--spinner');
      _this.storage = JSON.parse(localStorage.getItem(theme.local_storage.recent_products));
      if (_this.storage) {
        _this.load();
      } else {
        _this.root.hide();
      }
    }

    FrameworkRecentProducts.prototype.load = function() {
      var _this;
      _this = this;
      return _this.storage.forEach(function(handle) {
        return _this.renderProductItem(handle);
      });
    };

    FrameworkRecentProducts.prototype.renderProductItem = function(handle) {
      var _this, request;
      _this = this;
      request = new XMLHttpRequest();
      request.onload = function() {
        var product_html;
        if (request.status >= 200 && request.status < 300) {
          product_html = theme.utils.parseHtml(request.response, '.product--root');
          _this.main_grid.prepend(product_html);
          return _this.checkIfAllProductsLoaded();
        }
      };
      request.onerror = function() {
        _this.num_errors++;
        if (_this.num_errors === _this.storage.length) {
          return _this.root.hide();
        } else {
          return _this.checkIfAllProductsLoaded();
        }
      };
      request.open("GET", theme.urls.search + "?view=ajax-recent-product&handle=" + handle);
      return request.send();
    };

    FrameworkRecentProducts.prototype.checkIfAllProductsLoaded = function() {
      var _this;
      _this = this;
      _this.num_loaded++;
      if (_this.num_loaded === _this.storage.length) {
        _this.main_grid.removeAttr('style');
        _this.spinner.hide();
        return _this.formatProducts();
      }
    };

    FrameworkRecentProducts.prototype.formatProducts = function() {
      var _this;
      _this = this;
      _this.resizeListeners();
      _this.matchImageHeights();
      theme.utils.loadJsClasses(_this.main_grid);
      if (theme.settings.hover_image_enabled) {
        _this.hoverImagesLoaded();
      }
      if (theme.settings.quick_add) {
        theme.partials.OffCanvas.unload();
        return theme.partials.OffCanvas.load();
      }
    };

    FrameworkRecentProducts.prototype.resizeListeners = function() {
      var _this;
      _this = this;
      return theme.window.on('resize.RecentProducts', theme.utils.debounce(100, function() {
        return _this.matchImageHeights();
      }));
    };

    FrameworkRecentProducts.prototype.matchImageHeights = function() {
      var _this;
      _this = this;
      return theme.utils.matchImageHeights(_this.main_grid, _this.root.find('.product--root'), '.product--image-wrapper');
    };

    FrameworkRecentProducts.prototype.hoverImagesLoaded = function() {
      var _this;
      _this = this;
      return _this.main_grid.find('.product--hover-image').each(function(hover_image) {
        hover_image = el(hover_image);
        return theme.utils.imagesLoaded(hover_image, function() {
          var product;
          product = hover_image.closest('[data-hover-image="true"]');
          return product.attr('data-hover-image', 'loaded');
        });
      });
    };

    return FrameworkRecentProducts;

  })();

  theme.classes.FrameworkSearch = (function() {
    function FrameworkSearch(root) {
      var _this;
      this.root = root;
      this.resizeListeners = bind(this.resizeListeners, this);
      this.matchImageHeights = bind(this.matchImageHeights, this);
      this.toggleView = bind(this.toggleView, this);
      this.getResults = bind(this.getResults, this);
      this.listenForKeyEntered = bind(this.listenForKeyEntered, this);
      this.searchLinks = bind(this.searchLinks, this);
      this.onOpen = bind(this.onOpen, this);
      this.load = bind(this.load, this);
      _this = this;
      _this.articles = _this.root.find('.search--articles');
      _this.form = _this.root.find('form');
      _this.icon = _this.root.find('.search--icon');
      _this.loading = _this.root.find('.search--loading');
      _this.products = _this.root.find('.search--products');
      _this.results = _this.root.find('.search--results');
      _this.text_box = _this.root.find('.search--textbox');
      _this.toggle_link = _this.root.find('.search--toggle');
      _this.show_articles = _this.root.data('show-articles');
      _this.show_pages = _this.root.data('show-pages');
      _this.view = _this.root.data('view');
      _this.article_page_combination = "";
      _this.num_loaded_views = 0;
      _this.num_pending_views = 0;
      _this.offCanvas = theme.partials.OffCanvas;
      _this.typing_timer = null;
      if (_this.show_articles && _this.show_pages) {
        _this.article_page_combination = 'article,page';
      } else if (_this.show_articles) {
        _this.article_page_combination = 'article';
      } else if (_this.show_pages) {
        _this.article_page_combination = 'page';
      }
      _this.load();
    }

    FrameworkSearch.prototype.load = function() {
      var _this;
      _this = this;
      if (_this.view === 'modal') {
        _this.searchLinks();
        _this.listenForKeyEntered();
      }
      _this.resizeListeners();
      return _this.matchImageHeights();
    };

    FrameworkSearch.prototype.onOpen = function() {
      var _this, temp_val;
      _this = this;
      window.scrollTo(0, 0);
      _this.text_box.focus();
      temp_val = _this.text_box.val();
      _this.text_box.val('');
      _this.text_box.val(temp_val);
      return _this.text_box.trigger('keyup');
    };

    FrameworkSearch.prototype.searchLinks = function() {
      var _this;
      _this = this;
      el(".off-canvas--main-content a[href='" + theme.urls.search + "']").off('click');
      el(".off-canvas--main-content a[href='" + theme.urls.search + "']").on('click', function(event) {
        el('[data-trigger="search-modal"]').trigger('click');
        _this.onOpen();
        event.preventDefault();
        return event.stopPropagation();
      });
      el(".off-canvas--right-sidebar a[href='" + theme.urls.search + "']").off('click');
      el(".off-canvas--right-sidebar a[href='" + theme.urls.search + "']").on('click', function(event) {
        _this.offCanvas.closeRight();
        setTimeout(function() {
          el('[data-trigger="search-modal"]').trigger('click');
          return _this.onOpen();
        }, 450);
        event.preventDefault();
        return event.stopPropagation();
      });
      el(".off-canvas--left-sidebar a[href='" + theme.urls.search + "']").off('click');
      return el(".off-canvas--left-sidebar a[href='" + theme.urls.search + "']").on('click', function(event) {
        _this.offCanvas.closeLeft();
        setTimeout(function() {
          el('[data-trigger="search-modal"]').trigger('click');
          return _this.onOpen();
        }, 450);
        event.preventDefault();
        return event.stopPropagation();
      });
    };

    FrameworkSearch.prototype.listenForKeyEntered = function() {
      var _this;
      _this = this;
      return _this.text_box.attr("autocomplete", "off").on("keyup paste", function(event) {
        var term;
        clearTimeout(_this.typing_timer);
        term = el(this).val();
        if (term.length < 2 && event.type !== 'paste') {
          _this.toggleView(false, true);
          return false;
        }
        _this.toggleView(true, true);
        return _this.typing_timer = setTimeout(function() {
          var url;
          clearTimeout(_this.typing_timer);
          if (_this.show_articles || _this.show_pages) {
            _this.num_pending_views = 2;
            url = theme.urls.search + "?view=ajax-article-page&type=" + _this.article_page_combination + "&q=" + term + "*";
            _this.getResults(url, 'article');
          } else {
            _this.num_pending_views = 1;
          }
          url = theme.urls.search + "?view=ajax-product&type=product&q=" + term + "*";
          return _this.getResults(url, 'product');
        }, 750);
      });
    };

    FrameworkSearch.prototype.getResults = function(url, type) {
      var _this, request;
      _this = this;
      _this.toggleView(true, false);
      request = new XMLHttpRequest();
      request.onload = function() {
        var results_html;
        if (request.status >= 200 && request.status < 300) {
          _this.num_loaded_views += 1;
          results_html = theme.utils.parseHtml(request.response);
          if (type === 'product') {
            _this.products.empty().append(results_html);
            _this.matchImageHeights();
            theme.utils.loadJsClasses(el('.search--products-container'));
          } else if (type === 'article') {
            _this.articles.empty().append(results_html);
          }
          if (_this.num_loaded_views === _this.num_pending_views) {
            _this.toggleView(false, true);
            return _this.num_loaded_views = 0;
          }
        }
      };
      request.onerror = function() {
        return console.log(request.statusText + ": search.json request failed!");
      };
      request.open("GET", url);
      return request.send();
    };

    FrameworkSearch.prototype.toggleView = function(toggle_load, toggle_display) {
      var _this;
      _this = this;
      if (toggle_load) {
        _this.loading.show();
        _this.icon.hide();
      } else {
        _this.loading.hide();
        _this.icon.show();
      }
      if (toggle_display) {
        _this.products.css('opacity', '1');
        return _this.articles.css('opacity', '1');
      } else {
        _this.products.css('opacity', '0');
        return _this.articles.css('opacity', '0');
      }
    };

    FrameworkSearch.prototype.matchImageHeights = function() {
      var _this;
      _this = this;
      return theme.utils.matchImageHeights(_this.products, _this.products.find('.product--root'), '.product--image-wrapper');
    };

    FrameworkSearch.prototype.resizeListeners = function() {
      var _this;
      _this = this;
      return theme.window.on('resize.Search', theme.utils.debounce(100, function() {
        return _this.matchImageHeights();
      }));
    };

    return FrameworkSearch;

  })();

  theme.classes.FrameworkSections = (function() {
    function FrameworkSections() {
      this.deselectBlock = bind(this.deselectBlock, this);
      this.selectBlock = bind(this.selectBlock, this);
      this.deselectSection = bind(this.deselectSection, this);
      this.selectSection = bind(this.selectSection, this);
      this.unload = bind(this.unload, this);
      this.load = bind(this.load, this);
      this.getActiveBlock = bind(this.getActiveBlock, this);
      this.getActiveSection = bind(this.getActiveSection, this);
      this.listeners = bind(this.listeners, this);
      var _this;
      _this = this;
      _this.listeners();
    }

    FrameworkSections.prototype.listeners = function() {
      var _this;
      _this = this;
      _this.load();
      _this.unload();
      _this.selectSection();
      _this.deselectSection();
      _this.selectBlock();
      return _this.deselectBlock();
    };

    FrameworkSections.prototype.getActiveSection = function(event) {
      var _this, active_section;
      _this = this;
      active_section = el(event.target).find('[data-section-id]');
      return active_section;
    };

    FrameworkSections.prototype.getActiveBlock = function(event) {
      var _this, active_block;
      _this = this;
      active_block = el(event.target);
      return active_block;
    };

    FrameworkSections.prototype.load = function() {
      var _this;
      _this = this;
      return document.addEventListener('shopify:section:load', function(event) {
        var active_section;
        theme.utils.loadJsClasses();
        active_section = _this.getActiveSection(event);
        active_section.trigger('theme:section:load');
        return active_section.find('[data-js-class]').each(function(js_class) {
          return el(js_class).trigger('theme:section:load');
        });
      });
    };

    FrameworkSections.prototype.unload = function() {
      var _this;
      _this = this;
      return document.addEventListener('shopify:section:unload', function(event) {
        var active_section;
        active_section = _this.getActiveSection(event);
        active_section.trigger('theme:section:unload');
        return active_section.find('[data-js-loaded="true"]').each(function(loaded_class) {
          return el(loaded_class).trigger('theme:section:unload');
        });
      });
    };

    FrameworkSections.prototype.selectSection = function() {
      var _this;
      _this = this;
      return document.addEventListener('shopify:section:select', function(event) {
        var active_section;
        active_section = _this.getActiveSection(event);
        return active_section.trigger('theme:section:select');
      });
    };

    FrameworkSections.prototype.deselectSection = function() {
      var _this;
      _this = this;
      return document.addEventListener('shopify:section:deselect', function(event) {
        var active_section;
        active_section = _this.getActiveSection(event);
        return active_section.trigger('theme:section:deselect');
      });
    };

    FrameworkSections.prototype.selectBlock = function() {
      var _this;
      _this = this;
      return document.addEventListener('shopify:block:select', function(event) {
        var active_block;
        active_block = _this.getActiveBlock(event);
        return active_block.trigger('theme:block:select');
      });
    };

    FrameworkSections.prototype.deselectBlock = function() {
      var _this;
      _this = this;
      return document.addEventListener('shopify:block:deselect', function(event) {
        var active_block;
        active_block = _this.getActiveBlock(event);
        return active_block.trigger('theme:block:deselect');
      });
    };

    return FrameworkSections;

  })();

  theme.classes.FrameworkServiceList = (function() {
    function FrameworkServiceList(root) {
      var _this;
      this.root = root;
      this.balanceColumns = bind(this.balanceColumns, this);
      this.load = bind(this.load, this);
      _this = this;
      _this.block_list = _this.root.find('.service-list--blocks');
      _this.blocks = _this.root.find('li');
      _this.blocks_container = _this.root.find('.service-list--container');
      _this.headers = _this.root.find('.service-list--block-header');
      _this.single_column = _this.root.find('.service-list--single-column');
      _this.left_column = _this.root.find('.service-list--left-column');
      _this.right_column = _this.root.find('.service-list--right-column');
      _this.load();
    }

    FrameworkServiceList.prototype.load = function() {
      var _this;
      _this = this;
      return _this.balanceColumns();
    };

    FrameworkServiceList.prototype.balanceColumns = function() {
      var _this, assignLoopList, isTypeHeader, loop_list, offset, thresholdBreached, with_multiple_headers;
      _this = this;
      offset = _this.root.data('service-list--show-descriptions') === true ? 75 : 0;
      with_multiple_headers = _this.block_list.length > 1 ? true : false;
      isTypeHeader = function(item) {
        return item.hasClass('service-list--block-header');
      };
      thresholdBreached = function() {
        var left_column_height, right_column_height, single_column_height;
        single_column_height = _this.single_column.outerHeight();
        left_column_height = _this.left_column.outerHeight();
        right_column_height = _this.right_column.outerHeight();
        return left_column_height >= parseFloat(right_column_height + single_column_height - offset);
      };
      assignLoopList = function() {
        var blocks;
        if (with_multiple_headers) {
          _this.root.attr('data-service-list--has-headers', true);
          return _this.block_list;
        } else {
          blocks = theme.utils.parseHtml('<ul class="service-list--blocks"></ul>');
          _this.left_column.append(blocks);
          return _this.blocks;
        }
      };
      loop_list = assignLoopList();
      return loop_list.each(function(list, index) {
        if (thresholdBreached()) {
          _this.right_column.append(_this.single_column.find('.service-list--blocks'));
          return;
        } else {
          if (with_multiple_headers) {
            _this.left_column.append(el(list));
          } else {
            if (isTypeHeader(el(list))) {
              _this.blocks_container.prepend(el(list).find('.service-list--block-header--text'));
              el(list).remove();
            } else {
              _this.left_column.find('.service-list--blocks').append(el(list));
            }
          }
        }
        if (index === loop_list.length - 1 && _this.right_column.isEmpty() && _this.headers.length > 1) {
          return _this.right_column.append(_this.left_column.find('.service-list--blocks').last());
        }
      });
    };

    return FrameworkServiceList;

  })();

  theme.classes.FrameworkStickyColumn = (function() {
    function FrameworkStickyColumn(container1, column_a, column_b) {
      this.container = container1;
      this.column_a = column_a;
      this.column_b = column_b;
      this.Listeners = bind(this.Listeners, this);
      this.setColumnPosition = bind(this.setColumnPosition, this);
      this.getAlignment = bind(this.getAlignment, this);
      this.getState = bind(this.getState, this);
      this.resetLargerColumn = bind(this.resetLargerColumn, this);
      this.getSmallerColumn = bind(this.getSmallerColumn, this);
      this.heightsHaveChanged = bind(this.heightsHaveChanged, this);
      this.setHeights = bind(this.setHeights, this);
      this.loadColumns = bind(this.loadColumns, this);
      if (theme.utils.isTouchDevice()) {
        return false;
      }
      _this.current_state = 'auto';
      _this.column_a_height = 0;
      _this.column_b_height = 0;
      _this.loadColumns();
    }

    FrameworkStickyColumn.prototype.loadColumns = function() {
      var _this;
      _this = this;
      return theme.utils.imagesLoaded(_this.container, function() {
        _this.Listeners();
        return _this.setColumnPosition();
      });
    };

    FrameworkStickyColumn.prototype.setHeights = function() {
      _this.column_a_height = _this.column_a.outerHeight();
      return _this.column_b_height = _this.column_b.outerHeight();
    };

    FrameworkStickyColumn.prototype.heightsHaveChanged = function() {
      if (_this.column_a.outerHeight() !== _this.column_a_height) {
        _this.setHeights();
        return true;
      }
      if (_this.column_b.outerHeight() !== _this.column_b_height) {
        _this.setHeights();
        return true;
      }
      return false;
    };

    FrameworkStickyColumn.prototype.getSmallerColumn = function() {
      if (_this.column_a_height < _this.column_b_height) {
        return _this.column_a;
      } else {
        return _this.column_b;
      }
    };

    FrameworkStickyColumn.prototype.resetLargerColumn = function() {
      if (_this.column_a_height > _this.column_b_height) {
        _this.column_a.css('position', 'relative');
        _this.column_a.css('top', 'auto');
        return _this.column_a.css('bottom', 'auto');
      } else {
        _this.column_b.css('position', 'relative');
        _this.column_b.css('top', 'auto');
        return _this.column_b.css('bottom', 'auto');
      }
    };

    FrameworkStickyColumn.prototype.getState = function(scroll_pos, window_height, column) {
      var column_height, container_top, height_for_bottom, overflowing_column, state;
      state = 'auto';
      if (theme.utils.mqs.current_window === 'small') {
        return 'auto';
      }
      column_height = column.outerHeight();
      container_top = _this.container.offset().top;
      if (window_height > column_height) {
        overflowing_column = true;
      }
      if (scroll_pos < container_top) {
        state = 'auto';
      }
      if (overflowing_column) {
        height_for_bottom = column_height;
      } else {
        height_for_bottom = window_height;
      }
      if ((scroll_pos + height_for_bottom) > (container_top + _this.container.outerHeight())) {
        state = 'absolute-bottom';
      } else if (scroll_pos > container_top && overflowing_column) {
        state = 'fixed-top';
      } else if (window_height < column_height && (scroll_pos + window_height) > (container_top + column.outerHeight())) {
        state = 'fixed-bottom';
      }
      return state;
    };

    FrameworkStickyColumn.prototype.getAlignment = function(column) {
      if (column.hasClass('column-a')) {
        return 'left';
      } else if (column.hasClass('column-b')) {
        return 'right';
      }
    };

    FrameworkStickyColumn.prototype.setColumnPosition = function() {
      var _this, align, column, state;
      _this = this;
      _this.setHeights();
      column = _this.getSmallerColumn();
      state = _this.getState(window.pageYOffset, window.innerHeight, column);
      align = _this.getAlignment(column);
      if (state === 'auto' && _this.current_state !== 'auto') {
        _this.current_state = 'auto';
        column.css('position', 'relative');
        column.css('top', 'auto');
        column.css('bottom', 'auto');
      } else if (state === 'fixed-bottom' && _this.current_state !== 'fixed-bottom') {
        _this.current_state = 'fixed-bottom';
        column.css('position', 'fixed');
        column.css('top', 'auto');
        column.css('bottom', 0);
      } else if (state === 'fixed-top' && _this.current_state !== 'fixed-top') {
        _this.current_state = 'fixed-top';
        column.css('position', 'fixed');
        column.css('top', 0);
        column.css('bottom', 'auto');
      } else if (state === 'absolute-bottom' && _this.current_state !== 'absolute-bottom') {
        _this.current_state = 'absolute-bottom';
        column.css('position', 'absolute');
        column.css('top', 'auto');
        column.css('bottom', 0);
      }
      if (align === 'right') {
        return column.css('right', 0);
      }
    };

    FrameworkStickyColumn.prototype.Listeners = function() {
      var _this;
      _this = this;
      window.addEventListener('scroll', function() {
        return _this.setColumnPosition();
      });
      setInterval(function() {
        if (_this.heightsHaveChanged()) {
          _this.resetLargerColumn();
          return _this.setColumnPosition();
        }
      }, 250);
      return window.addEventListener('resize', function() {
        _this.resetLargerColumn();
        return _this.setColumnPosition();
      });
    };

    return FrameworkStickyColumn;

  })();

  theme.classes.FrameworkTabOrder = (function() {
    function FrameworkTabOrder(mobile_order, desktop_order) {
      var _this;
      this.mobile_order = mobile_order;
      this.desktop_order = desktop_order;
      this.resizeListener = bind(this.resizeListener, this);
      this.disableFocus = bind(this.disableFocus, this);
      this.enableCustomFocus = bind(this.enableCustomFocus, this);
      this.updateOrderList = bind(this.updateOrderList, this);
      this.getElementList = bind(this.getElementList, this);
      this.load = bind(this.load, this);
      _this = this;
      _this.mobile_order_elements = _this.getElementList(_this.mobile_order);
      _this.desktop_order_elements = _this.getElementList(_this.desktop_order);
      _this.load();
    }

    FrameworkTabOrder.prototype.load = function() {
      var _this;
      _this = this;
      _this.updateOrderList();
      _this.enableCustomFocus();
      return _this.resizeListener();
    };

    FrameworkTabOrder.prototype.getElementList = function(order_list) {
      var _this, order_list_elements;
      _this = this;
      if (order_list) {
        order_list_elements = [];
        order_list.forEach(function(container_class) {
          if (el(container_class).length) {
            return order_list_elements.push(el(container_class).first());
          }
        });
        return order_list_elements;
      } else {
        return false;
      }
    };

    FrameworkTabOrder.prototype.updateOrderList = function() {
      var _this;
      _this = this;
      if (theme.utils.mqs.current_window === 'small') {
        _this.current_order_elements = _this.mobile_order_elements;
        return _this.previous_order_elements = _this.desktop_order_elements;
      } else {
        _this.current_order_elements = _this.desktop_order_elements;
        return _this.previous_order_elements = _this.mobile_order_elements;
      }
    };

    FrameworkTabOrder.prototype.enableCustomFocus = function() {
      var _this;
      _this = this;
      if (!_this.current_order_elements) {
        return;
      }
      return _this.current_order_elements.forEach(function(element, index) {
        return element.on('focusout', function(event) {
          var focusable_elements, lost_focus, move_to;
          if (!theme.utils.tabbing) {
            return;
          }
          lost_focus = !el(this).has(event.relatedTarget) && theme.partials.OffCanvas.state === 'closed';
          if (lost_focus && theme.utils.tab_forwards) {
            if ((index + 1) < _this.current_order_elements.length) {
              move_to = _this.current_order_elements[index + 1];
              focusable_elements = theme.utils.getFocusableEl(move_to);
              if (focusable_elements) {
                return focusable_elements.focus(0);
              }
            }
          } else if (lost_focus) {
            if ((index - 1) >= 0) {
              move_to = _this.current_order_elements[index - 1];
              focusable_elements = theme.utils.getFocusableEl(move_to);
              if (focusable_elements) {
                return focusable_elements.focus(focusable_elements.length - 1);
              }
            }
          }
        });
      });
    };

    FrameworkTabOrder.prototype.disableFocus = function() {
      var _this;
      _this = this;
      if (!_this.previous_order_elements) {
        return;
      }
      return _this.previous_order_elements.forEach(function(element) {
        return el(element).off('focusout');
      });
    };

    FrameworkTabOrder.prototype.resizeListener = function() {
      var _this;
      _this = this;
      return window.addEventListener('theme:utils:mqs:updated', function() {
        _this.updateOrderList();
        _this.enableCustomFocus();
        return _this.disableFocus();
      });
    };

    return FrameworkTabOrder;

  })();

  theme.classes.Transition = (function() {
    function Transition(root) {
      var _this;
      this.root = root;
      this.transitionListeners = bind(this.transitionListeners, this);
      this.updateState = bind(this.updateState, this);
      this.setState = bind(this.setState, this);
      this.load = bind(this.load, this);
      _this = this;
      _this.state = 'at_start';
      _this.load();
    }

    Transition.prototype.load = function() {
      var _this;
      _this = this;
      _this.setState(_this.state);
      return _this.transitionListeners();
    };

    Transition.prototype.setState = function(state) {
      var _this;
      _this = this;
      _this.root.setAttribute('data-transition', state);
      return _this.state = state;
    };

    Transition.prototype.updateState = function() {
      var _this;
      _this = this;
      return _this.state = _this.root.getAttribute('data-transition');
    };

    Transition.prototype.transitionListeners = function() {
      var _this;
      _this = this;
      return _this.root.on('transitionend', function() {
        _this.updateState();
        if (_this.state === 'forwards') {
          _this.setState('at_end');
          return _this.root.trigger('transition:at_end');
        } else if (_this.state === 'backwards') {
          _this.setState('at_start');
          return _this.root.trigger('transition:at_start');
        }
      });
    };

    return Transition;

  })();

  theme.classes.FrameworkUtils = (function() {
    function FrameworkUtils() {
      this.isTouchDevice = bind(this.isTouchDevice, this);
      this.loadJsClasses = bind(this.loadJsClasses, this);
      this.getHiddenElHeight = bind(this.getHiddenElHeight, this);
      this.detectTabDirection = bind(this.detectTabDirection, this);
      this.detectTabbing = bind(this.detectTabbing, this);
      var _this;
      _this = this;
      _this.carousel_script_status = null;
      _this.google_maps_script_status = null;
      _this.mqs = new theme.classes.FrameworkMediaQueries();
      _this.detectTabbing();
      _this.detectTabDirection();
    }

    FrameworkUtils.prototype.swipe = function() {
      var _this;
      _this = this;
      SwipeListener(document, {
        preventScroll: function(event) {
          var x_swipe_distance, y_swipe_distance;
          x_swipe_distance = Math.abs(event.detail.x[0] - event.detail.x[1]);
          y_swipe_distance = Math.abs(event.detail.y[0] - event.detail.y[1]) * 2;
          if (x_swipe_distance > y_swipe_distance) {
            return true;
          } else {
            return false;
          }
        }
      });
      return document.addEventListener('swipe', function(event) {
        var directions;
        directions = event.detail.directions;
        if (directions.left) {
          el(this).trigger("theme:swipe:left");
        }
        if (directions.right) {
          el(this).trigger("theme:swipe:right");
        }
        if (directions.top) {
          el(this).trigger("theme:swipe:up");
        }
        if (directions.bottom) {
          return el(this).trigger("theme:swipe:down");
        }
      });
    };

    FrameworkUtils.prototype.a11yClick = function(event) {
      var code;
      if (event.type === 'click') {
        return true;
      } else if (event.type === 'keypress') {
        code = event.charCode || event.keyCode;
        if (code === 32) {
          event.preventDefault();
        }
        if (code === 32 || code === 13) {
          return true;
        }
      }
      return false;
    };

    FrameworkUtils.prototype.detectTabbing = function() {
      var _this;
      _this = this;
      theme.window.on('click load', function() {
        _this.tabbing = false;
        return el('body').attr('data-tabbing', _this.tabbing);
      });
      return window.addEventListener('keydown', function(event) {
        if (event.which === 9 || event.which === 37 || event.which === 38 || event.which === 39 || event.which === 40 || event.which === 27) {
          _this.tabbing = true;
          return el('body').attr('data-tabbing', _this.tabbing);
        }
      });
    };

    FrameworkUtils.prototype.detectTabDirection = function() {
      var _this;
      _this = this;
      _this.tab_forwards = null;
      return el(document).on('keydown.detectTabbing', function(event) {
        _this.tab_forwards = true;
        if (event.which === 9 && event.shiftKey) {
          _this.tab_forwards = false;
        }
        return true;
      });
    };

    FrameworkUtils.prototype.getFocusableEl = function(container) {
      var focusable_elements;
      if (container.length) {
        return focusable_elements = container.find('button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])').filter(':not([disabled])');
      }
    };

    FrameworkUtils.prototype.stylesheetLoaded = function() {
      var stylesheetPromise;
      return stylesheetPromise = new Promise(function(resolve) {
        var link;
        link = document.querySelector("link[href='" + theme.assets.stylesheet + "']");
        if (link.loaded) {
          resolve();
        }
        return link.addEventListener('load', function() {
          return setTimeout(resolve, 0);
        });
      });
    };

    FrameworkUtils.prototype.parseHtml = function(html_string, selector) {
      var container, parsed_element;
      container = document.createElement("div");
      container.innerHTML = html_string;
      if (!selector) {
        selector = ':scope > *';
      }
      parsed_element = el(selector, container);
      if (parsed_element.length) {
        return parsed_element;
      } else {
        return false;
      }
    };

    FrameworkUtils.prototype.getHiddenElHeight = function(element, fixed_width) {
      var cloned_el, el_height, el_padding, el_width;
      if (fixed_width == null) {
        fixed_width = true;
      }
      el_padding = element.css('padding');
      cloned_el = element.clone();
      cloned_el.css('visibility', 'hidden');
      cloned_el.css('display', 'block');
      cloned_el.css('position', 'absolute');
      cloned_el.css('padding', el_padding);
      if (fixed_width) {
        el_width = element.width();
        cloned_el.css('width', el_width + "px");
      }
      el('body').append(cloned_el);
      el_height = cloned_el.height();
      cloned_el.remove();
      return el_height;
    };

    FrameworkUtils.prototype.debounce = function(delay, fn) {
      var timeoutId;
      timeoutId = void 0;
      return function() {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(fn.bind(this), delay, arguments);
      };
    };

    FrameworkUtils.prototype.imagesLoaded = function(selector, callback) {
      var count, images_length;
      count = 0;
      images_length = selector.find('img[data-sizes="auto"]').length;
      if (images_length < 1) {
        callback();
        return;
      }
      return selector.on('lazybeforeunveil', function(event) {
        return el(event.target).on('load', function() {
          count++;
          if (count === images_length) {
            return callback();
          }
        });
      });
    };

    FrameworkUtils.prototype.loadJsClasses = function(container) {
      var _this;
      if (container == null) {
        container = el('body');
      }
      _this = this;
      return container.find('[data-js-class]').each(function(js_element) {
        var js_class, partial_class;
        js_class = el(js_element).attr('data-js-class');
        if (!el(js_element).data('js-loaded')) {
          partial_class = theme.classes[js_class];
          if (typeof partial_class !== 'undefined') {
            theme.partials[js_class] = new partial_class(el(js_element));
            return el(js_element).attr('data-js-loaded', 'true');
          }
        }
      });
    };

    FrameworkUtils.prototype.matchImageHeights = function(container, items, image_class, items_to_ignore) {
      var _this, current_row, extra_ignore_blocks, greatest_image_height, ignore_item_rows, ignore_item_widths, image_roots, images, items_per_row, row_items;
      if (items_to_ignore == null) {
        items_to_ignore = false;
      }
      _this = this;
      if (!items.length) {
        return;
      }
      images = items.find(image_class + ", .placeholder--root").css('height', 'auto');
      image_roots = items.find(image_class + " .image--root, .placeholder--root");
      items_per_row = Math.floor(container.width() / image_roots.width());
      if (isNaN(items_per_row)) {
        return;
      }
      if (items_to_ignore) {
        ignore_item_rows = [];
        ignore_item_widths = [];
        extra_ignore_blocks = 0;
        items_to_ignore.each(function(item) {
          var row, width;
          row = Math.floor((extra_ignore_blocks + el(item).index()) / items_per_row) + 1;
          width = Math.floor(el(item).width() / image_roots.width());
          extra_ignore_blocks += width - 1;
          if (ignore_item_rows.includes(row)) {
            return ignore_item_widths[ignore_item_rows.indexOf(row)] += width;
          } else {
            ignore_item_rows.push(row);
            return ignore_item_widths.push(width);
          }
        });
      }
      row_items = el();
      current_row = 1;
      greatest_image_height = 0;
      return items.each(function(item, index) {
        var end_of_row, number_items_to_skip, this_height;
        if (el(item).find('.image--root').length > 0) {
          this_height = el(item).find(image_class + " .image--root").outerHeight();
        } else {
          this_height = el(item).find('.placeholder--root').outerHeight();
        }
        if (this_height > greatest_image_height) {
          greatest_image_height = this_height;
        }
        end_of_row = false;
        row_items = row_items.add(el(item));
        if (index + 1 === items.length) {
          end_of_row = true;
        } else if (items_to_ignore && ignore_item_rows.includes(current_row)) {
          number_items_to_skip = ignore_item_widths[ignore_item_rows.indexOf(current_row)];
          if (number_items_to_skip === items_per_row) {
            current_row++;
          } else {
            end_of_row = (row_items.length + number_items_to_skip) === items_per_row;
          }
          if (number_items_to_skip === 1 && items_per_row === 1) {
            end_of_row = true;
          }
        } else if (row_items.length === items_per_row) {
          end_of_row = true;
        }
        if (end_of_row) {
          row_items.find(image_class + ", .placeholder--root").height(greatest_image_height);
          row_items = el();
          current_row++;
          return greatest_image_height = 0;
        }
      });
    };

    FrameworkUtils.prototype.insertStylesheet = function(src) {
      var _this, stylesheet;
      _this = this;
      stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = src;
      return document.head.appendChild(stylesheet);
    };

    FrameworkUtils.prototype.insertScript = function(src, callback) {
      var _this, script;
      _this = this;
      script = document.createElement('script');
      script.src = src;
      if (callback) {
        script.onload = callback;
      }
      return document.body.appendChild(script);
    };

    FrameworkUtils.prototype.formatMoney = function(raw_amount) {
      var _this, formatWithSeperators, formatted_amount, money_format, regex;
      _this = this;
      regex = /\{\{\s*(\w+)\s*\}\}/;
      money_format = theme.shop.money_format.match(regex)[1];
      formatWithSeperators = function(amount_in_cents, decimal_places, swap_seperators) {
        var amount_components, cents, cents_seperator, dollars, thousand_seperator;
        thousand_seperator = swap_seperators ? '.' : ',';
        cents_seperator = swap_seperators ? ',' : '.';
        amount_components = (amount_in_cents / 100).toFixed(decimal_places).split('.');
        cents = amount_components[1] ? cents_seperator + amount_components[1] : '';
        dollars = amount_components[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousand_seperator);
        return dollars + cents;
      };
      switch (money_format) {
        case 'amount':
          formatted_amount = formatWithSeperators(raw_amount, 2, false);
          break;
        case 'amount_no_decimals':
          formatted_amount = formatWithSeperators(raw_amount, 0, false);
          break;
        case 'amount_with_comma_separator':
          formatted_amount = formatWithSeperators(raw_amount, 2, true);
          break;
        case 'amount_no_decimals_with_comma_separator':
          formatted_amount = formatWithSeperators(raw_amount, 0, true);
      }
      return theme.shop.money_format.replace(regex, formatted_amount);
    };

    FrameworkUtils.prototype.isTouchDevice = function() {
      var _this;
      _this = this;
      if (window.matchMedia("(pointer: coarse)").matches) {
        return true;
      } else {
        return false;
      }
    };

    return FrameworkUtils;

  })();

  theme.classes.FrameworkXMenu = (function() {
    function FrameworkXMenu(root) {
      var _this;
      this.root = root;
      this.transitionListeners = bind(this.transitionListeners, this);
      this.slideUp = bind(this.slideUp, this);
      this.slideDown = bind(this.slideDown, this);
      this.arrangeMegaNav = bind(this.arrangeMegaNav, this);
      this.resizeListeners = bind(this.resizeListeners, this);
      this.checkOverlap = bind(this.checkOverlap, this);
      this.listeners = bind(this.listeners, this);
      this.load = bind(this.load, this);
      _this = this;
      _this.debugging = false;
      _this.state = 'closed';
      _this.parent_links = _this.root.find('.x-menu--level-1--link > a');
      _this.sub_menu_links = _this.root.find('.x-menu--level-1--link:not([data-x-menu--depth="1"]) > a');
      _this.sub_menu_items = _this.sub_menu_links.parent().find('ul a');
      _this.parents_with_sub_menu = _this.sub_menu_links.parent();
      _this.overlap_parent = _this.root.data('x-menu--overlap-parent');
      _this.header_root = el('.header--root');
      _this.load();
    }

    FrameworkXMenu.prototype.load = function() {
      var _this;
      _this = this;
      _this.arrangeMegaNav();
      _this.listeners();
      _this.checkOverlap();
      _this.resizeListeners();
      return _this.transitionListeners();
    };

    FrameworkXMenu.prototype.listeners = function() {
      var _this, sub_menu;
      _this = this;
      _this.parents_with_sub_menu.on('mouseenter.XMenu', function() {
        return _this.slideDown(el(this).find('> a'));
      });
      _this.parents_with_sub_menu.on('mouseleave.XMenu', function() {
        return _this.slideUp();
      });
      _this.parent_links.on('focus', function() {
        return _this.slideUp();
      });
      _this.sub_menu_links.on('focus', function() {
        return _this.slideDown(el(this));
      });
      _this.sub_menu_links.on('touchstart.XMenu', function(event) {
        event.preventDefault();
        if (el(this).parent().data('x-menu--open')) {
          return _this.slideUp();
        } else {
          return _this.slideDown(el(this));
        }
      });
      return sub_menu = el('.x-menu--level-2--container');
    };

    FrameworkXMenu.prototype.checkOverlap = function() {
      var _this, center_index, center_item, center_item_left_edge, center_item_right_edge, center_item_width, container, container_width, first_center_child, last_center_child, left_break_point, left_item, right_item, right_item_edge;
      _this = this;
      if (theme.utils.isTouchDevice() && theme.utils.mqs.current_window !== 'large') {
        _this.root.attr('data-x-menu--overlap', 'true');
        _this.header_root.attr('data-x-menu--overlap', 'true');
        return false;
      }
      _this.root.attr('data-x-menu--overlap', 'false');
      _this.header_root.attr('data-x-menu--overlap', 'false');
      center_item = _this.root;
      if (_this.overlap_parent === 1) {
        center_item = center_item.parent();
      } else if (_this.overlap_parent === 2) {
        center_item = center_item.parent().parent();
      }
      container = center_item.parent();
      center_index = center_item.index();
      left_item = false;
      if (center_index > 1) {
        left_item = container.children().eq(center_index - 1);
      }
      right_item = false;
      if (center_index + 1 < container.children().length) {
        right_item = container.children().eq(center_index + 1);
      }
      container_width = container.width();
      center_item_width = _this.root.outerWidth();
      if (left_item) {
        first_center_child = center_item.find('> :first-child');
        center_item_left_edge = first_center_child.offset().left - 1;
        left_break_point = (container_width - center_item_width) / 2;
        if (left_edge >= center_item_left_edge) {
          _this.root.attr('data-x-menu--overlap', 'true');
          _this.header_root.attr('data-x-menu--overlap', 'true');
        }
      }
      if (right_item) {
        last_center_child = center_item.find('> :last-child');
        center_item_right_edge = last_center_child.outerWidth() + last_center_child.offset().left + 1;
        right_item_edge = right_item.offset().left;
        if (center_item_right_edge >= right_item_edge) {
          _this.root.attr('data-x-menu--overlap', 'true');
          return _this.header_root.attr('data-x-menu--overlap', 'true');
        }
      }
    };

    FrameworkXMenu.prototype.resizeListeners = function() {
      var _this;
      _this = this;
      return theme.window.on('resize.XMenu', theme.utils.debounce(100, function() {
        return _this.checkOverlap();
      }));
    };

    FrameworkXMenu.prototype.arrangeMegaNav = function() {
      var _this, mega_navs;
      _this = this;
      if (_this.parents_with_sub_menu.length === 0) {
        return false;
      }
      mega_navs = _this.root.find('[data-x-menu--depth="3"] .x-menu--level-2--container');
      return mega_navs.each(function(nav) {
        var container, empty_list, single_parents, single_parents_container;
        container = el(nav);
        single_parents = container.find('[data-x-menu--single-parent="true"]');
        if (single_parents.length > 0) {
          single_parents_container = theme.utils.parseHtml('<div class="x-menu--single-parents"></div>');
          container.prepend(single_parents_container);
          empty_list = theme.utils.parseHtml('<ul>');
          return single_parents_container.append(empty_list).find('ul').append(single_parents);
        }
      });
    };

    FrameworkXMenu.prototype.slideDown = function(link, delay) {
      var _this, link_wrapper, sub_menu;
      if (delay == null) {
        delay = false;
      }
      _this = this;
      clearTimeout(_this.timer);
      link_wrapper = link.parent();
      if (link_wrapper.data('x-menu--open') || _this.state === 'closing') {
        return false;
      }
      _this.slideUp(false);
      if (delay && delay !== 'complete') {
        _this.timer = setTimeout(function() {
          return _this.slideDown(link, 'complete');
        }, delay);
      } else {
        link.closest('.x-menu--level-1--link').find('.icon--chevron-up').css('display', 'inline');
        link.closest('.x-menu--level-1--link').find('.icon--chevron-down').hide();
        link.closest('.x-menu--level-1--link').find('.icon--minus').show();
        link.closest('.x-menu--level-1--link').find('.icon--plus').hide();
        link_wrapper.attr('data-x-menu--open', 'true');
        link.attr('aria-expanded', 'true');
        sub_menu = link.closest('.x-menu--level-1--link').find('.x-menu--level-2--container');
        sub_menu.attr('data-transition', 'forwards');
        sub_menu.css('height', 'auto');
        _this.state = 'open';
      }
    };

    FrameworkXMenu.prototype.slideUp = function(delay) {
      var _this, link, link_wrapper, sub_menu;
      if (delay == null) {
        delay = 300;
      }
      _this = this;
      if (_this.debugging) {
        return false;
      }
      link_wrapper = _this.parents_with_sub_menu.filter('[data-x-menu--open="true"]');
      link = link_wrapper.find('> a');
      if (!link_wrapper.data('x-menu--open')) {
        return false;
      }
      if (delay) {
        return _this.timer = setTimeout(function() {
          return _this.slideUp(false);
        }, delay);
      } else {
        link.closest('.x-menu--level-1--link').find('.icon--chevron-up').hide();
        link.closest('.x-menu--level-1--link').find('.icon--chevron-down').css('display', 'inline');
        link.closest('.x-menu--level-1--link').find('.icon--minus').hide();
        link.closest('.x-menu--level-1--link').find('.icon--plus').show();
        sub_menu = link.closest('.x-menu--level-1--link').find('.x-menu--level-2--container');
        link_wrapper.attr('data-x-menu--open', 'false');
        link.attr('aria-expanded', 'false');
        return sub_menu.attr('data-transition', 'backwards');
      }
    };

    FrameworkXMenu.prototype.transitionListeners = function() {
      var _this;
      _this = this;
      return _this.sub_menu_links.each(function(sub_links) {
        var sub_menu_containers;
        if (el(sub_links).parent() !== void 0) {
          sub_menu_containers = el(sub_links).parent().find('.x-menu--level-2--container');
          return sub_menu_containers.on('transition:at_start', function() {
            return el(this).css('height', 0);
          });
        }
      });
    };

    return FrameworkXMenu;

  })();

  theme.classes.FrameworkYMenu = (function() {
    function FrameworkYMenu(root) {
      var _this;
      this.root = root;
      this.slideRight = bind(this.slideRight, this);
      this.slideLeft = bind(this.slideLeft, this);
      this.adjustHeight = bind(this.adjustHeight, this);
      this.listeners = bind(this.listeners, this);
      this.load = bind(this.load, this);
      _this = this;
      _this.state = 'closed';
      _this.sub_menu_links = _this.root.find('.icon--chevron-right--small').parent();
      _this.back_links = _this.root.find('.y-menu--back-link a');
      _this.regular_links = _this.root.find('.y-menu--level-1--link > a:not([data-submenu="true"]), .y-menu--level-2--link > a:not([data-submenu="true"]), .y-menu--level-3--link > a:not([data-submenu="true"])');
      _this.timer = null;
      _this.load();
    }

    FrameworkYMenu.prototype.load = function() {
      var _this;
      _this = this;
      return _this.listeners();
    };

    FrameworkYMenu.prototype.listeners = function() {
      var _this;
      _this = this;
      _this.regular_links.on('click', function() {
        var href;
        href = el(this).attr('href');
        if (href.indexOf('#') !== -1) {
          if (theme.partials.OffCanvas.state === 'left--opened') {
            theme.partials.OffCanvas.closeLeft();
          } else if (theme.partials.OffCanvas.state === 'right--opened') {
            theme.partials.OffCanvas.closeRight();
          }
          setTimeout(function() {
            return window.location.href = href;
          }, 450);
        }
      });
      _this.sub_menu_links.on('click', function(event) {
        _this.slideLeft(el(this));
        event.preventDefault();
        return event.stopPropagation();
      });
      return _this.back_links.on('click', function(event) {
        _this.slideRight(el(this));
        event.preventDefault();
        return event.stopPropagation();
      });
    };

    FrameworkYMenu.prototype.adjustHeight = function(open_list) {
      var _this, current_height, open_list_height;
      _this = this;
      open_list_height = open_list.outerHeight();
      current_height = _this.root.outerHeight();
      _this.root.height(current_height);
      if (open_list.css('position') === 'absolute') {
        open_list.css('position', 'relative');
        open_list_height = open_list.outerHeight();
        open_list.css('position', 'absolute');
      }
      return _this.root.height(open_list_height);
    };

    FrameworkYMenu.prototype.slideLeft = function(link) {
      var _this, sub_menu;
      _this = this;
      sub_menu = link.closest('li').find('ul').first();
      sub_menu.css('display', 'block');
      _this.adjustHeight(sub_menu);
      return sub_menu.css('transform', 'translateX(-100%)');
    };

    FrameworkYMenu.prototype.slideRight = function(link, close) {
      var _this, container, parent_container;
      _this = this;
      container = link.closest('ul');
      parent_container = container.parent().closest('ul');
      _this.adjustHeight(parent_container);
      return container.css('transform', 'translateX(0)');
    };

    return FrameworkYMenu;

  })();

  theme.classes.Article = (function(superClass) {
    extend(Article, superClass);

    function Article() {
      return Article.__super__.constructor.apply(this, arguments);
    }

    return Article;

  })(theme.classes.FrameworkArticle);

  theme.classes.Blog = (function(superClass) {
    extend(Blog, superClass);

    function Blog() {
      return Blog.__super__.constructor.apply(this, arguments);
    }

    return Blog;

  })(theme.classes.FrameworkBlog);

  theme.classes.Cart = (function(superClass) {
    extend(Cart, superClass);

    function Cart() {
      this.updateTotalsComplete = bind(this.updateTotalsComplete, this);
      return Cart.__super__.constructor.apply(this, arguments);
    }

    Cart.prototype.updateTotalsComplete = function(count) {
      var _this;
      _this = this;
      if (count > 0) {
        return el('.header--cart-link').attr('data-has-items', 'true');
      } else {
        return el('.header--cart-link').attr('data-has-items', 'false');
      }
    };

    return Cart;

  })(theme.classes.FrameworkCart);

  theme.classes.Collection = (function(superClass) {
    extend(Collection, superClass);

    function Collection() {
      return Collection.__super__.constructor.apply(this, arguments);
    }

    return Collection;

  })(theme.classes.FrameworkCollection);

  theme.classes.Disclosure = (function(superClass) {
    extend(Disclosure, superClass);

    function Disclosure() {
      return Disclosure.__super__.constructor.apply(this, arguments);
    }

    return Disclosure;

  })(theme.classes.FrameworkDisclosure);

  theme.classes.FeaturedCollection = (function(superClass) {
    extend(FeaturedCollection, superClass);

    function FeaturedCollection() {
      return FeaturedCollection.__super__.constructor.apply(this, arguments);
    }

    return FeaturedCollection;

  })(theme.classes.FrameworkFeaturedCollection);

  theme.classes.FeaturedVideo = (function(superClass) {
    extend(FeaturedVideo, superClass);

    function FeaturedVideo() {
      return FeaturedVideo.__super__.constructor.apply(this, arguments);
    }

    return FeaturedVideo;

  })(theme.classes.FrameworkFeaturedVideo);

  theme.classes.Footer = (function(superClass) {
    extend(Footer, superClass);

    function Footer() {
      return Footer.__super__.constructor.apply(this, arguments);
    }

    return Footer;

  })(theme.classes.FrameworkFooter);

  theme.classes.Header = (function() {
    function Header(root) {
      var _this;
      this.root = root;
      this.detectAndLockHeader = bind(this.detectAndLockHeader, this);
      this.scrollListener = bind(this.scrollListener, this);
      this.sectionListeners = bind(this.sectionListeners, this);
      this.moveLocalizationForm = bind(this.moveLocalizationForm, this);
      this.moveSearchIcon = bind(this.moveSearchIcon, this);
      this.moveAccountIcon = bind(this.moveAccountIcon, this);
      this.moveYMenu = bind(this.moveYMenu, this);
      this.load = bind(this.load, this);
      _this = this;
      _this.container = _this.root.find('.header--container');
      _this.fixed_enabled = _this.root.data('fixed-enabled');
      _this.fixed_state = false;
      _this.header_offset = _this.root.offset().top;
      _this.logo_position = _this.root.attr('data-logo-position');
      _this.off_canvas_main_content = el('.off-canvas--main-content');
      _this.localization_form = _this.root.find('.header--localization-for-off-canvas > *');
      _this.mobile_nav_menu = el('.mobile-nav--menu');
      _this.mobile_nav_localization = el('.mobile-nav--localization');
      _this.mobile_nav_login = el('.mobile-nav--login');
      _this.mobile_nav_login_icon = _this.root.find('.mobile-nav--login--for-off-canvas > *');
      _this.mobile_nav_search = el('.mobile-nav--search');
      _this.mobile_nav_search_icon = _this.root.find('.mobile-nav--search--for-off-canvas > *');
      _this.y_menu = _this.root.find('.y-menu');
      _this.load();
    }

    Header.prototype.load = function() {
      var _this;
      _this = this;
      _this.moveYMenu();
      _this.moveAccountIcon();
      _this.moveSearchIcon();
      _this.moveLocalizationForm();
      _this.sectionListeners();
      if (_this.fixed_enabled) {
        return _this.scrollListener();
      }
    };

    Header.prototype.moveYMenu = function() {
      var _this;
      _this = this;
      _this.mobile_nav_menu.empty();
      if (_this.mobile_nav_menu.length && _this.y_menu.length) {
        return _this.mobile_nav_menu.append(_this.y_menu);
      }
    };

    Header.prototype.moveAccountIcon = function() {
      var _this;
      _this = this;
      _this.mobile_nav_login.empty();
      if (_this.mobile_nav_login.length && _this.mobile_nav_login_icon.length) {
        return _this.mobile_nav_login.append(_this.mobile_nav_login_icon);
      }
    };

    Header.prototype.moveSearchIcon = function() {
      var _this;
      _this = this;
      _this.mobile_nav_search.empty();
      if (_this.mobile_nav_search.length && _this.mobile_nav_search_icon.length) {
        return _this.mobile_nav_search.append(_this.mobile_nav_search_icon);
      }
    };

    Header.prototype.moveLocalizationForm = function() {
      var _this;
      _this = this;
      _this.mobile_nav_localization.empty();
      if (_this.localization_form.length) {
        return _this.mobile_nav_localization.append(_this.localization_form);
      }
    };

    Header.prototype.sectionListeners = function() {
      var _this;
      _this = this;
      return _this.root.on('theme:section:load', function() {
        if (el('.modal--window').css('display') === 'block') {
          el('.modal--close').trigger('click');
        }
        theme.partials.OffCanvas.unload();
        theme.partials.OffCanvas.load();
        if (_this.mobile_nav_search_icon.length) {
          return theme.partials.FrameworkSearch.searchLinks();
        }
      });
    };

    Header.prototype.scrollListener = function() {
      var _this;
      _this = this;
      theme.window.on("DOMMouseScroll mousewheel touchmove", function(event) {
        return _this.detectAndLockHeader();
      }, true);
      return window.addEventListener("scroll", function() {
        return _this.detectAndLockHeader();
      });
    };

    Header.prototype.detectAndLockHeader = function() {
      var _this, main_content_offset, modal_opened, off_canvas_opened, scroll_top;
      _this = this;
      modal_opened = el('body').data('modal-open');
      off_canvas_opened = theme.partials.OffCanvas.state !== 'closed';
      if (off_canvas_opened || modal_opened) {
        return;
      }
      scroll_top = window.pageYOffset;
      if (scroll_top > _this.header_offset && !_this.fixed_state) {
        _this.fixed_state = true;
        _this.root.attr('data-fixed', "" + _this.fixed_state);
        main_content_offset = _this.root.outerHeight() + 'px';
      } else if (scroll_top <= _this.header_offset && _this.fixed_state) {
        _this.fixed_state = false;
        _this.root.attr('data-fixed', "" + _this.fixed_state);
        main_content_offset = 0;
      } else {
        return;
      }
      _this.off_canvas_main_content.css('padding-top', main_content_offset);
      return _this.root.trigger('state_updated');
    };

    return Header;

  })();

  theme.classes.Map = (function(superClass) {
    extend(Map, superClass);

    function Map() {
      return Map.__super__.constructor.apply(this, arguments);
    }

    return Map;

  })(theme.classes.FrameworkMap);

  theme.classes.OffCanvas = (function(superClass) {
    extend(OffCanvas, superClass);

    function OffCanvas() {
      return OffCanvas.__super__.constructor.apply(this, arguments);
    }

    return OffCanvas;

  })(theme.classes.FrameworkOffCanvas);

  theme.classes.PasswordPage = (function(superClass) {
    extend(PasswordPage, superClass);

    function PasswordPage() {
      return PasswordPage.__super__.constructor.apply(this, arguments);
    }

    return PasswordPage;

  })(theme.classes.FrameworkPasswordPage);

  theme.classes.Popup = (function() {
    function Popup(root) {
      var _this;
      this.root = root;
      _this = this;
      _this.container = _this.root.find('.popup--container');
      _this.close_link = _this.root.find('.popup--close');
      _this.show_again_after = _this.root.data('show-again-after');
      _this.mode = _this.root.data('mode');
      _this.newsletter_form = _this.root.find('#contact_form');
      _this.body = el('body');
      _this.eventListeners();
      _this.autoPopup();
    }

    Popup.prototype.eventListeners = function() {
      var _this;
      _this = this;
      _this.close_link.on('keypress.Popup, click.Popup', function() {
        _this.close();
        return false;
      });
      return _this.newsletter_form.on('submit', function(event) {
        var form, success_message;
        event.preventDefault();
        form = el(this);
        form.find('.error, .success').remove();
        form.find('input[type="email"], [type="submit"]').hide();
        success_message = theme.utils.parseHtml("<p class='success'>" + theme.translations.mailing_list_success_message + "</p>");
        form.prepend(success_message).show();
        setTimeout(function() {
          return form.submit();
        }, 500);
        return false;
      });
    };

    Popup.prototype.open = function(source) {
      var _this, offset;
      _this = this;
      if (el('.template--index .banner').length && source === 'auto') {
        _this.delayUntilValidScrollPosition();
        return false;
      }
      _this.container.attr('aria-hidden', false);
      _this.container.attr('data-transition', 'forwards');
      offset = _this.container.outerHeight();
      _this.body.css('padding-bottom', offset + "px");
      return _this.body.attr('data-popup-open', true);
    };

    Popup.prototype.delayUntilValidScrollPosition = function() {
      var _this;
      _this = this;
      return theme.window.on("DOMMouseScroll.Popup mousewheel.Popup touchmove.Popup scroll.Popup touchmove.Popup", function() {
        var header_offset;
        header_offset = el('.header--root').offset().top;
        if (window.pageYOffset > header_offset) {
          _this.open();
          return theme.window.off("DOMMouseScroll.Popup mousewheel.Popup touchmove.Popup scroll.Popup touchmove.Popup");
        }
      }, true);
    };

    Popup.prototype.close = function() {
      var _this;
      _this = this;
      _this.body.css('padding-bottom', 0);
      _this.body.attr('data-popup-open', false);
      _this.container.attr('data-transition', 'backwards');
      return _this.container.attr('aria-hidden', true);
    };

    Popup.prototype.autoPopup = function() {
      var _this;
      _this = this;
      if (_this.mode === 'manual') {
        return;
      }
      if (!window.localStorage || _this.mode === 'test') {
        return setTimeout(function() {
          return _this.open('auto');
        }, 1000);
      } else if (localStorage[theme.local_storage.popup] === void 0) {
        _this.setResetTime();
        return setTimeout(function() {
          return _this.open('auto');
        }, 1000);
      } else if (_this.readyToReset()) {
        _this.setResetTime();
        return setTimeout(function() {
          return _this.open('auto');
        }, 1000);
      }
    };

    Popup.prototype.readyToReset = function() {
      var _this, expires, now;
      _this = this;
      expires = JSON.parse(localStorage[theme.local_storage.popup]).popup_expires;
      now = new Date().getTime();
      if (parseFloat(expires - now) <= 0) {
        _this.setResetTime();
        return true;
      }
      return false;
    };

    Popup.prototype.setResetTime = function() {
      var _this, date, expires, object, seconds_from_now;
      _this = this;
      date = new Date();
      seconds_from_now = 1000 * 60 * 60 * 24 * _this.show_again_after;
      expires = date.setTime(date.getTime() + seconds_from_now);
      object = {
        popup_expires: expires
      };
      localStorage[theme.local_storage.popup] = JSON.stringify(object);
      return _this;
    };

    return Popup;

  })();

  theme.classes.ProductModel = (function(superClass) {
    extend(ProductModel, superClass);

    function ProductModel() {
      return ProductModel.__super__.constructor.apply(this, arguments);
    }

    return ProductModel;

  })(theme.classes.FrameworkProductModel);

  theme.classes.ProductRecommendations = (function(superClass) {
    extend(ProductRecommendations, superClass);

    function ProductRecommendations() {
      return ProductRecommendations.__super__.constructor.apply(this, arguments);
    }

    return ProductRecommendations;

  })(theme.classes.FrameworkProductRecommendations);

  theme.classes.ProductVideo = (function(superClass) {
    extend(ProductVideo, superClass);

    function ProductVideo() {
      return ProductVideo.__super__.constructor.apply(this, arguments);
    }

    return ProductVideo;

  })(theme.classes.FrameworkProductVideo);

  theme.classes.Product = (function(superClass) {
    extend(Product, superClass);

    function Product(root) {
      var _this;
      this.root = root;
      this.gridImageZoom = bind(this.gridImageZoom, this);
      this.imageZoom = bind(this.imageZoom, this);
      this.onLoadZoomListener = bind(this.onLoadZoomListener, this);
      this.modalListeners = bind(this.modalListeners, this);
      this.goToSlide = bind(this.goToSlide, this);
      this.updateVariantMedia = bind(this.updateVariantMedia, this);
      this.goToSlideOnCarouselLoad = bind(this.goToSlideOnCarouselLoad, this);
      this.updateModelButton = bind(this.updateModelButton, this);
      this.onSlideListener = bind(this.onSlideListener, this);
      this.pauseOtherMedia = bind(this.pauseOtherMedia, this);
      this.updateTopPositions = bind(this.updateTopPositions, this);
      this.setRelativeSidebarPosition = bind(this.setRelativeSidebarPosition, this);
      this.setFixedSidebarPosition = bind(this.setFixedSidebarPosition, this);
      this.headerStateListener = bind(this.headerStateListener, this);
      this.load = bind(this.load, this);
      _this = this;
      _this.carousel = _this.root.find('.carousel--root');
      _this.carousel_container = _this.carousel.find('.carousel--x-container');
      _this.first_media_id = _this.root.find('.product-media--featured[data-active="true"]').data('id');
      _this.header = el('.header--root');
      _this.image_containers = _this.root.find('.product-media--wrapper[data-media-type="image"]');
      _this.is_product_page = _this.root.hasClass('product-page--root');
      _this.right_column = _this.root.find('.product-page--right-column');
      _this.section_id = _this.root.data('section-id');
      Product.__super__.constructor.apply(this, arguments);
    }

    Product.prototype.load = function() {
      var _this;
      _this = this;
      Product.__super__.load.apply(this, arguments);
      if (_this.is_product_page) {
        _this.headerStateListener();
        _this.setFixedSidebarPosition();
        _this.pauseOtherMedia();
        _this.onSlideListener();
        _this.goToSlideOnCarouselLoad();
        _this.modalListeners();
        if (_this.zoom_enabled) {
          return _this.onLoadZoomListener();
        }
      }
    };

    Product.prototype.headerStateListener = function() {
      var _this;
      _this = this;
      return _this.header.on('state_updated', function() {
        _this.setFixedSidebarPosition();
        if (_this.zoom_enabled) {
          return _this.updateTopPositions();
        }
      });
    };

    Product.prototype.setFixedSidebarPosition = function() {
      var _this;
      _this = this;
      if (theme.partials.OffCanvas.state === 'closed') {
        return _this.right_column.css('top', (_this.header.height()) + "px");
      }
    };

    Product.prototype.setRelativeSidebarPosition = function() {
      var _this;
      _this = this;
      if (theme.utils.mqs.current_window !== 'small') {
        return _this.right_column.css('top', window.pageYOffset + "px");
      }
    };

    Product.prototype.updateTopPositions = function() {
      var _this;
      _this = this;
      _this.top_positions = [];
      return _this.image_containers.each(function(container) {
        var top_offset;
        top_offset = el(container).offset().top;
        return _this.top_positions.push(top_offset);
      });
    };

    Product.prototype.pauseOtherMedia = function() {
      var _this;
      _this = this;
      return _this.root.find('.product-media--featured > *').on('click', function() {
        return _this.root.find('.product-media--featured > *').not(el(this)).trigger('pause-media');
      });
    };

    Product.prototype.onSlideListener = function() {
      var _this;
      _this = this;
      return _this.carousel_container.on('transition:at_end', function() {
        var active_block_index, active_container, media_containers;
        media_containers = el(this).find('.product-media--featured > *');
        active_block_index = theme.carousels[_this.section_id].active_slide - 1;
        active_container = media_containers.eq(active_block_index);
        media_containers.not(active_container).trigger('pause-media');
        return _this.updateModelButton(active_container.parent());
      });
    };

    Product.prototype.updateModelButton = function(media_container) {
      var _this, media_id, variant_button;
      _this = this;
      media_id = media_container.data('id');
      _this.model_buttons.attr('data-active', 'false');
      variant_button = _this.model_buttons.filter("[data-shopify-model3d-id='" + media_id + "']");
      return variant_button.attr('data-active', 'true');
    };

    Product.prototype.goToSlideOnCarouselLoad = function() {
      var _this;
      _this = this;
      return _this.carousel.on('loaded', function() {
        return _this.goToSlide(_this.first_media_id);
      });
    };

    Product.prototype.updateVariantMedia = function(variant_media_id) {
      var _this;
      _this = this;
      if (_this.is_product_page) {
        return _this.goToSlide(variant_media_id);
      } else {
        return Product.__super__.updateVariantMedia.apply(this, arguments);
      }
    };

    Product.prototype.goToSlide = function(variant_media_id) {
      var _this, new_media, new_slide;
      _this = this;
      new_media = _this.carousel.find(".product-media--featured[data-id='" + variant_media_id + "']");
      if (!new_media.length) {
        return;
      }
      new_slide = new_media.closest('.carousel--block').index() + 1;
      theme.carousels[_this.section_id].updateThenGoToActiveSlide(new_slide);
      return _this.updateModelButton(new_media);
    };

    Product.prototype.modalListeners = function() {
      var _this;
      _this = this;
      window.addEventListener('theme:modal:closed', function() {
        return _this.setFixedSidebarPosition();
      });
      return window.addEventListener('theme:modal:opened', function() {
        return _this.setRelativeSidebarPosition();
      });
    };

    Product.prototype.onLoadZoomListener = function() {
      var _this;
      _this = this;
      return window.addEventListener('load', function() {
        _this.updateTopPositions();
        return _this.imageZoom();
      });
    };

    Product.prototype.imageZoom = function() {
      var _this;
      _this = this;
      if (_this.image_containers.length && theme.utils.mqs.current_window !== 'small') {
        return _this.gridImageZoom();
      }
    };

    Product.prototype.gridImageZoom = function() {
      var _this;
      _this = this;
      return _this.image_containers.each(function(container, index) {
        var active_zoom_image, image_container, left_position, magnified_height, magnified_width, wrapper_height, wrapper_width, x_ratio, y_ratio;
        image_container = el(container);
        active_zoom_image = _this.zoom_images.eq(index);
        active_zoom_image.css('display', 'none');
        image_container.off("mouseenter.Product.ImageZoom." + index + " mouseleave.Product.ImageZoom." + index + " .Product.ImageZoom." + index);
        if (active_zoom_image.length > 0) {
          wrapper_width = image_container.width();
          wrapper_height = image_container.height();
          magnified_width = wrapper_width * _this.magnify;
          magnified_height = wrapper_height * _this.magnify;
          x_ratio = (magnified_width - wrapper_width) / wrapper_width;
          y_ratio = (magnified_height - wrapper_height) / wrapper_height;
          left_position = image_container.offset().left;
          active_zoom_image.css('width', magnified_width + "px");
          active_zoom_image.find('.image--root').css('width', magnified_width + "px");
          active_zoom_image.find('img').addClass('lazypreload');
          image_container.on("mouseenter.Product.ImageZoom." + index, function() {
            return active_zoom_image.css('display', 'block');
          });
          image_container.on("mouseleave.Product.ImageZoom." + index, function() {
            return active_zoom_image.css('display', 'none');
          });
          return image_container.on("mousemove.Product.ImageZoom." + index, function(event) {
            var relative_left, relative_top;
            relative_left = event.pageX - left_position;
            relative_top = event.pageY - _this.top_positions[index];
            active_zoom_image.css('left', (relative_left * -x_ratio) + "px");
            return active_zoom_image.css('top', (relative_top * -y_ratio) + "px");
          });
        }
      });
    };

    return Product;

  })(theme.classes.FrameworkProduct);

  theme.classes.Radios = (function(superClass) {
    extend(Radios, superClass);

    function Radios() {
      return Radios.__super__.constructor.apply(this, arguments);
    }

    return Radios;

  })(theme.classes.FrameworkRadios);

  theme.classes.RecentProducts = (function(superClass) {
    extend(RecentProducts, superClass);

    function RecentProducts() {
      return RecentProducts.__super__.constructor.apply(this, arguments);
    }

    return RecentProducts;

  })(theme.classes.FrameworkRecentProducts);

  theme.classes.Sections = (function(superClass) {
    extend(Sections, superClass);

    function Sections() {
      return Sections.__super__.constructor.apply(this, arguments);
    }

    return Sections;

  })(theme.classes.FrameworkSections);

  theme.classes.ServiceList = (function(superClass) {
    extend(ServiceList, superClass);

    function ServiceList() {
      return ServiceList.__super__.constructor.apply(this, arguments);
    }

    return ServiceList;

  })(theme.classes.FrameworkServiceList);

  theme.classes.XMenu = (function(superClass) {
    extend(XMenu, superClass);

    function XMenu(root) {
      var _this;
      this.root = root;
      this.getLongestDropDrown = bind(this.getLongestDropDrown, this);
      this.orientateDropDown = bind(this.orientateDropDown, this);
      this.load = bind(this.load, this);
      _this = this;
      _this.longest_drop_down = _this.getLongestDropDrown();
      _this.bottom_position_for_sub_above = window.innerHeight - _this.root.offset().top;
      _this.banner_exists = el('.banner--container').length > 0;
      XMenu.__super__.constructor.apply(this, arguments);
    }

    XMenu.prototype.load = function() {
      var _this;
      _this = this;
      XMenu.__super__.load.apply(this, arguments);
      theme.window.on('resize scroll', function() {
        return _this.orientateDropDown();
      });
      return _this.orientateDropDown();
    };

    XMenu.prototype.orientateDropDown = function() {
      var _this, banner_exists;
      _this = this;
      banner_exists = el('.banner--container').length > 0;
      if (banner_exists && window.pageYOffset < 50 && _this.longest_drop_down + 150 < window.innerHeight) {
        return _this.root.attr('data-x-menu--sub-above', 'true');
      } else {
        return _this.root.attr('data-x-menu--sub-above', 'false');
      }
    };

    XMenu.prototype.getLongestDropDrown = function() {
      var _this, longest, sub_menus;
      _this = this;
      longest = 0;
      sub_menus = _this.root.find('.x-menu--level-2--container');
      sub_menus.each(function(sub_menu) {
        if (el(sub_menu).outerHeight() > longest) {
          return longest = el(sub_menu).outerHeight();
        }
      });
      return longest;
    };

    return XMenu;

  })(theme.classes.FrameworkXMenu);

  el = function(selector, container) {
    if (container == null) {
      container = document;
    }
    return new theme.classes.FrameworkDomElement(selector, container);
  };

  new (Main = (function() {
    function Main() {
      this.loadSwipeLibrary = bind(this.loadSwipeLibrary, this);
      this.configureLinks = bind(this.configureLinks, this);
      this.load = bind(this.load, this);
      var _this;
      _this = this;
      _this.load();
    }

    Main.prototype.load = function() {
      var _this;
      _this = this;
      theme.window = el(window);
      theme.sections = new theme.classes.Sections();
      theme.utils = new theme.classes.FrameworkUtils();
      theme.utils.stylesheetLoaded().then(function() {
        theme.utils.loadJsClasses();
        return el('body').attr('data-assets-loaded', 'true');
      });
      _this.configureLinks();
      return _this.loadSwipeLibrary();
    };

    Main.prototype.configureLinks = function() {
      return el('[data-item="hidden-text"] a').attr('tabindex', '-1');
    };

    Main.prototype.loadSwipeLibrary = function() {
      return theme.utils.insertScript(theme.assets.swipe, function() {
        return theme.utils.swipe();
      });
    };

    return Main;

  })());

}).call(this);
