// Main jQuery document ready function
$(function() {
    // Initialize various components and event handlers
    $('.main-menu').pbtMenu();
    
    // Search functionality
    $('.search-toggle').on('click', function(e) {
        openSearch();
        closeSearch();
    });
    
    // Keyboard shortcuts for search
    $(window).on('keydown', function(e) {
        if (e.ctrlKey && e.keyCode === 75) { // Ctrl+K
            e.preventDefault();
            openSearch();
            closeSearch();
        }
    });
    
    // Social links processing
    $('.sidebar .social a').each(function() {
        let $this = $(this),
            href = $this.attr('href'),
            parts = href.split('#'),
            text = $this.text();
        
        if (parts[1] && !text) {
            let label = parts[1].trim();
            if (label) {
                $this.append('<span class="text">' + label + '</span>');
            }
        }
        $this.attr('href', parts[0].trim());
    });
    
    // Mailchimp form handling
    $('.MailChimp').each(function() {
        let $this = $(this),
            $form = $this.find('.mailchimp-form');
        
        if (options.subscribeFormUrl) {
            if (options.subscribeMessage) {
                $this.find('.mailchimp-text').html(options.subscribeMessage);
            }
            $form.attr('action', options.subscribeFormUrl)
                .attr('method', 'post')
                .find('input[type=submit]').prop('disabled', true);
        }
    });
    
    // Button component initialization
    $('.button').each(function() {
        let $this = $(this),
            text = $this.text(),
            attrText = getAttr(text, 'text'),
            attrClass = getAttr(text, 'class'),
            attrSize = getAttr(text, 'size'),
            attrColor = getAttr(text, 'color'),
            attrIcon = getAttr(text, 'icon'),
            attrId = getAttr(text, 'id'),
            bgImage = $this.parent().attr('style');
        
        if (text.match(/\{button\}/) && attrText) {
            $this.html(text.replace(/([^{\}]+(?=}))/g, '<em>$1</em>'));
            $this.find('em').replaceText('$', '%s');
            
            $this.each(function() {
                let $btn = $(this),
                    btnText = $btn.text(),
                    textVal = getAttr(btnText, 'text'),
                    btnClass = getAttr(btnText, 'class'),
                    btnId = getAttr(btnText, 'id');
                
                $btn.addClass(attrSize ? 'x' + attrSize : 'x1')
                    .text(textVal.replace('%s', '$'));
                
                if (btnId) {
                    $btn.attr('id', $btn.attr('id') + '-' + btoa(btnId));
                }
                
                if (btnClass !== false) {
                    $btn.addClass(btnClass);
                }
                
                if (attrColor) {
                    $btn.addClass('has-color').attr('style', 'background:' + attrColor + ';');
                }
                
                if (bgImage && bgImage.match('background-image')) {
                    $btn.addClass('is-c');
                }
                
                if (attrIcon) {
                    $btn.addClass(btnClass ? 'icon-' + btnClass : 'x2');
                    $btn.append('<span class="btn-icon">' + attrIcon.replace('%s', '$') + '</span>');
                }
            });
        }
    });
    
    // Alert boxes processing
    $('.alert-box').each(function() {
        let $this = $(this),
            replacements = [
                { shc: '{alertSuccess}', cls: 'success' },
                { shc: '{alertInfo}', cls: 'info' },
                { shc: '{alertWarning}', cls: 'warning' },
                { shc: '{alertError}', cls: 'error' },
                { shc: '{codeBox}', cls: 'code' }
            ],
            originalText = $this.text(),
            content = $this.html();
        
        function replaceAlert(shortcode, className) {
            if (originalText.trim().indexOf(shortcode) > -1) {
                content = content.replace(shortcode, '');
                $this.html(className !== 'code' ? 
                    '<div class="alert-message alert-' + className + '">' + content + '</div>' : 
                    '<pre class="code-box">' + content + '</pre>');
            }
        }
        
        for (let i in replacements) {
            replaceAlert(replacements[i].shc, replacements[i].cls);
        }
    });
    
    // Shortcode processing
    $('.shortcode').each(function() {
        let $this = $(this),
            text = $this.text();
        
        function hasShortcode(sc) {
            return text.indexOf(sc) > -1;
        }
        
        // Table of Contents
        if (hasShortcode('{getToc}')) {
            let tocTitle = getAttr(text, 'title'),
                tocExpanded = getAttr(text, 'expanded');
            
            tocTitle = tocTitle || 'Table of Contents';
            $this.html('<div class="pbt-toc-wrap"><div class="pbt-toc-inner">' +
                '<button class="pbt-toc-title" aria-label="' + tocTitle + 
                '" aria-expanded="' + (tocExpanded || 'true') + '">' +
                '<span class="pbt-toc-title-text">' + tocTitle + 
                '</span></button><ol id="pbt-toc" data-count=""></ol></div></div>');
            
            let $toc = $('#pbt-toc');
            
            if (tocExpanded && tocExpanded === 'true') {
                $('.pbt-toc-title').addClass('is-expanded');
                $toc.show();
            }
            
            $('.pbt-toc-title').on('click', function() {
                $(this).toggleClass('is-expanded');
                $toc.slideToggle(170);
            });
            
            $toc.pbtToc({
                content: '#post-body',
                headings: 'h2,h3,h4'
            });
            
            $toc.find('a').each(function() {
                let $link = $(this);
                $link.on('click', function(e) {
                    e.preventDefault();
                    $('html, body').animate({
                        scrollTop: $($link.attr('href')).offset().top - 20
                    }, 500);
                    return false;
                });
            });
        }
        
        // Contact Form
        if (hasShortcode('{contactForm}')) {
            $this.html('<div class="contact-form-widget"/>');
            $('.post-body .contact-form-widget').append($('#ContactForm1 form'));
        }
        
        // Layout shortcodes
        let layoutShortcodes = [
            { shc: '{leftSidebar}', cls: 'is-left' },
            { shc: '{rightSidebar}', cls: 'is-right' },
            { shc: '{noSidebar}', cls: 'no-sidebar' },
            { shc: '{fullWidth}', cls: 'full-width' }
        ];
        
        function processLayout(sc, cls) {
            if (hasShortcode(sc)) {
                if (!$body.attr('class').match(/is-left|is-right|no-sidebar/)) {
                    $body.addClass(cls);
                    if (cls === 'is-right') {
                        $body.addClass('no-sidebar');
                    }
                }
                $this.remove();
            }
        }
        
        for (let i in layoutShortcodes) {
            processLayout(layoutShortcodes[i].shc, layoutShortcodes[i].cls);
        }
    });
    
    // Window open links
    $('.window-open').on('click', function(e) {
        e.preventDefault();
        let $this = $(this),
            href = $this.attr('href'),
            newWindow = window.open(href, '_blank', 'scrollbars=yes,resizable=yes,toolbar=0,width=860,height=540,top=50,left=50');
        newWindow.focus();
    });
    
    // Keyboard shortcuts for sharing
    $(window).on('keydown', function(e) {
        if (pbt.shareShortcut && e.ctrlKey && e.keyCode === 83) { // Ctrl+S
            e.preventDefault();
            openShare();
        }
    });
    
    // Share buttons
    $('.post-share .show-more button, .share-toggle').on('click', function() {
        openShare();
    });
    
    // Copy link functionality
    $('.copy-link').each(function() {
        let $this = $(this),
            $input = $this.parent().find('input');
        
        $input.attr('id', 'share-link').text('Copy').attr('style', 'visibility:visible!important;opacity:1!important;position:relative!important;z-index:1!important;font-size:0.875rem!important;color:var(--footerbar-color)!important;margin:0!important;text-indent:0!important;');
        
        $input.on('focus', function() {
            this.select();
        });
        
        $this.parent().find('button').on('click', function() {
            navigator.clipboard.writeText($input.val());
            $this.removeClass('copied-off').addClass('copied');
            setTimeout(function() {
                $this.removeClass('copied').addClass('copied-off');
            }, 3000);
        });
    });
    
    // Author links processing
    $('.author-links').each(function() {
        let $this = $(this),
            $links = $this.find('a');
        
        if ($links.length) {
            $links.each(function() {
                let $link = $(this),
                    linkText = $link.text().trim(),
                    linkHref = $link.attr('href'),
                    iconClass = 'web' === linkText ? 'globe' : linkText;
                
                $link.html('<li class="bi-' + iconClass + '"><a class="bi-' + iconClass + 
                    '" href="' + linkHref + '" rel="nofollow noopener" target="_blank"></a></li>')
                    .attr('title', iconClass);
            });
            
            $this.parent().append('<ul class="author-links social color"></ul>');
            $this.find('li').appendTo($this.parent().find('.author-links'));
        }
    });
    
    // Keyboard navigation
    $(window).on('keydown', function(e) {
        if (pbt.keyboardNav) {
            if (e.shiftKey && e.keyCode === 37) { // Shift+Left
                e.preventDefault();
                navShortcuts(pbt.isRTL ? '.post-nav-newer-link' : '.post-nav-older-link');
            } else if (e.shiftKey && e.keyCode === 39) { // Shift+Right
                e.preventDefault();
                navShortcuts(pbt.isRTL ? '.post-nav-older-link' : '.post-nav-newer-link');
            }
        }
    });
    
    // Search form handling
    $('.search-form').each(function() {
        let $this = $(this),
            $input = $this.find('input'),
            $results = $this.find('.search-results'),
            timeout;
        
        $(window).on('input', function(e) {
            e.preventDefault();
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                getSearch($input, $results);
            }, 500);
        });
    });
    
    // Related posts
    $('.related-posts').each(function() {
        let $this = $(this),
            shortcode = $this.data('shortcode');
        
        if (shortcode) {
            $('.blog-posts').each(function() {
                let $posts = $(this),
                    $loadMore = $posts.find('#load-more'),
                    postId = $loadMore.data('id'),
                    label = $loadMore.data('label'),
                    [numPosts, relatedLabel] = (function() {
                        let num = getAttr(shortcode, 'num'),
                            lbl = getAttr(shortcode, 'label');
                        return [num ? Number(num) + 1 : 5, lbl];
                    })(),
                    finalLabel = relatedLabel && relatedLabel !== label && relatedLabel !== 'related' ? 
                        relatedLabel : label;
                
                if (relatedLabel && relatedLabel !== label && relatedLabel !== 'related') {
                    $posts.parent().find('.title-link').attr('href', '/search/label/' + finalLabel);
                }
                
                $(window).on('scroll', function loadMore() {
                    if ($(window).scrollTop() + $(window).height() >= $posts.offset().top) {
                        $(window).off('load resize scroll', loadMore);
                        getPosts({
                            t: $posts,
                            type: 'related',
                            num: numPosts,
                            label: finalLabel,
                            id: postId
                        });
                        $this.parent().remove();
                    }
                }).trigger('scroll');
            });
        }
    });
    
    // Comments handling
    $('.blog-post-comments').each(function() {
        let $this = $(this),
            shortcode = $this.data('shortcode'),
            type = getAttr(shortcode, 'type'),
            commentsClass = type + '-comments visible';
        
        switch (type) {
            case 'disqus':
                let shortname = getAttr(shortcode, 'shortname');
                if (shortname !== false) {
                    disqus_shortname = shortname;
                }
                disqusComments(disqus_shortname);
                $this.addClass(commentsClass + ' visible');
                break;
                
            case 'facebook':
                let lang = getAttr(shortcode, 'lang');
                let fbScript = lang !== false ? 
                    'https://connect.facebook.net/' + lang + '/sdk.js#xfbml=1&version=v14.0' : 
                    'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v14.0';
                
                $('head').append('<script async src="' + fbScript + '"></script>');
                $this.addClass(commentsClass)
                    .find('#comments')
                    .html('<div class="fb-comments" data-width="100%" data-href="' + 
                        disqus_blogger_current_url + '" order_by="time" data-numposts="5" data-lazy="true"></div>');
                $this.addClass('visible');
                break;
                
            default:
                $this.addClass('blogger-comments');
                $this.find('.comment-reply').addClass('btn');
                beautiAvatar('.avatar-image-container img');
        }
        
        let $showComments = $this.find('.show-comments'),
            $hideComments = $this.find('.hide-comments'),
            $commentForm = $this.find('.comment-form');
        
        $showComments.on('click', function(e) {
            e.preventDefault();
            $this.addClass('cf-on');
            $hideComments.show();
            $commentForm.remove();
        });
        
        $hideComments.on('click', function(e) {
            e.preventDefault();
            $hideComments.hide();
        });
        
        $commentForm.on('click', function() {
            $this.addClass('cf-on');
            $commentForm.remove();
        });
    });
    
    // Various initializations
    (function() {
        // Logo handling
        $('.logo').each(function() {
            var $this = $(this),
                defaultLogo = 'https://probloggertemplates.com/';
            $this.attr('href', defaultLogo)
                .text('Blogger Templates')
                .attr('style', '--footerbar-color:var(--accent-color)!important;');
            $this.parent().attr('style', defaultLogo)
                .parent().attr('style', defaultLogo);
        });
        
        // Periodic logo check
        setInterval(function() {
            if ($('.logo').length && $('.mobile-logo').length) {
                window.location.href = 'https://probloggertemplates.com/';
            }
        }, 1000);
        
        // Lazy loading
        $('.entry-thumbnail .thumbnail, .entry-avatar .avatar').pbtLazy();
        
        // Sticky menu
        $('.main-header').each(function() {
            let $header = $(this);
            if (pbt.stickyMenu && $header.length > 0) {
                let lastScroll = $(document).scrollTop(),
                    headerOffset = $header.offset().top,
                    headerHeight = $header.height(),
                    triggerPoint = headerOffset + 2 * headerHeight;
                
                $(window).scroll(function() {
                    let currentScroll = $(document).scrollTop(),
                        currentOffset = $header.offset().top,
                        adminBar = $('.admin-bar').offset().top + 1;
                    
                    if (currentScroll > triggerPoint) {
                        $header.addClass('is-fixed');
                    } else if (currentOffset <= adminBar) {
                        $header.removeClass('is-fixed').removeClass('is-hidden');
                    }
                    
                    if (currentScroll < lastScroll) {
                        setTimeout(function() {
                            if (currentOffset >= adminBar) {
                                $header.addClass('is-hidden');
                            }
                        }, 250);
                    } else {
                        setTimeout(function() {
                            $header.removeClass('is-hidden');
                        }, 250);
                    }
                    
                    lastScroll = currentScroll;
                });
            }
        });
        
        // Mobile menu
        $('.mobile-menu').each(function() {
            let $this = $(this),
                $menu = $('.main-nav').clone();
            
            $menu.attr('class', 'mobile-nav')
                .find('a').attr('class', 'mobile-nav-link');
            
            $menu.appendTo($this);
            
            $('.menu-toggle').on('click', function() {
                $body.toggleClass('menu-on');
            });
            
            $('.hide-mobile-menu').on('click', function() {
                $body.removeClass('menu-on');
            });
            
            $('.mobile-menu .has-sub > a').on('click', function(e) {
                e.preventDefault();
                let $link = $(this);
                if ($link.parent().hasClass('expanded')) {
                    $link.parent().removeClass('expanded')
                        .children('ul').slideUp(170);
                } else {
                    $link.parent().addClass('expanded')
                        .children('ul').slideToggle(170);
                }
            });
        });
        
        // Mobile menu footer
        $('.mm-footer').each(function() {
            let $this = $(this),
                $social = $('.footer-info .social'),
                $menu = $('.footer-menu ul'),
                socialClone = !!$social.length && $social.clone(),
                menuClone = !!$menu.length && $menu.clone();
            
            if (socialClone) {
                socialClone.attr('class', 'social color')
                    .find('.text').remove();
                $this.append(socialClone);
            }
            
            if (menuClone) {
                menuClone.attr('class', 'footer-links');
                $this.append(menuClone);
            }
        });
        
        // Load more posts
        $('#load-more').each(function() {
            let $this = $(this),
                $loader = $('.blog-pager .loading'),
                visible = 'visible',
                loadUrl = $this.data('url');
            
            $this.on('click', function(e) {
                e.preventDefault();
                $this.addClass(visible);
                
                $.ajax({
                    url: loadUrl,
                    beforeSend: function() {
                        $loader.addClass(visible);
                    },
                    success: function(data) {
                        let $posts = $(data).find('.blog-posts');
                        $posts.find('.post').each(function(index) {
                            $(this).addClass('fadeInUp')
                                .attr('style', 'animation-delay:' + (0.1 * index).toFixed(1) + 's;');
                        });
                        
                        $('.blog-posts').append($posts.html());
                        loadUrl = $(data).find('#load-more').data('load');
                        
                        if (loadUrl) {
                            $this.removeClass(visible);
                        } else {
                            $this.addClass(visible);
                            $('.blog-pager .no-more').addClass(visible);
                        }
                    },
                    complete: function() {
                        $loader.removeClass(visible);
                        $('.blog-posts .thumbnail').pbtLazy('.pbt-lazy').pbtLazy();
                    }
                });
            });
        });
        
        // Post content processing
        $('.post-body').each(function() {
            let $this = $(this);
            
            // Image shortcode
            $this.html($this.html().replace(/\{image\}([^\}]*)\{\/image\}/g, 
                '<div class="thumbnail" data-src="$1"></div>'));
            
            // Video shortcode
            $this.html($this.html().replace(/\{video\}([^\}]*)\{\/video\}/g, 
                '<div class="comment-video" data-id="$1"></div>'));
            
            // YouTube video processing
            $this.find('.comment-video').each(function() {
                var url;
                let $video = $(this),
                    videoUrl = $video.text(),
                    urlObj = new URL(videoUrl),
                    params = new URLSearchParams(urlObj.search),
                    videoId = (!!videoUrl.match('youtube.com') && params.get('v')) || 
                              (!!videoUrl.match('youtu.be') && urlObj.pathname.replace('/', ''));
                
                $video.html(videoId ? 
                    '<div class="thumbnail"><img width="100%" height="315" src="https://i.ytimg.com/vi/' + 
                    videoId + '/hqdefault.jpg" alt="YouTube Video Cover" loading="lazy"/><span class="yt-img"></span></div>' : 
                    '<div class="thumbnail"><img src="' + pbt.noThumbnail + '"/></div>');
            });
            
            // YouTube video player
            $this.find('.comment-video-url').each(function() {
                let $this = $(this),
                    videoId = $this.data('id');
                
                $this.on('click', function() {
                    $this.html('<iframe width="100%" height="315" src="https://www.youtube.com/embed/' + 
                        videoId + '" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>');
                });
            });
        });
        
        // Cookie consent
        $('.cookie-consent').each(function() {
            let $this = $(this),
                $button = $this.find('.consent-button');
            
            if ('true' !== Cookies.get('cookie_consent')) {
                $this.css('display', 'block');
                $(window).on('load', function() {
                    $this.addClass('visible');
                });
            }
            
            $button.off('click').on('click', function(e) {
                e.stopPropagation();
                Cookies.set('cookie_consent', 'true', {
                    expires: 7,
                    path: '/'
                });
                $this.removeClass('visible');
                setTimeout(function() {
                    $this.css('display', 'none');
                }, 500);
            });
        });
        
        // Back to top button
        $('.to-top').each(function() {
            let $this = $(this);
            
            $(window).scroll(function() {
                if ($(this).scrollTop() >= 100) {
                    $this.addClass('show');
                } else {
                    $this.removeClass('show');
                }
                
                if ($this.offset().top >= $('.site-footer').offset().top - 36) {
                    $this.addClass('on-footer');
                } else {
                    $this.removeClass('on-footer');
                }
            });
            
            $this.on('click', function() {
                $('html, body').animate({
                    scrollTop: 0
                }, 500);
            });
        });
    });
    
    // Initialize pbt object if needed
    if (pbt.isPost) {
        window.pbtToc = {};
    }
});

// Helper functions

function getAttr(str, attr) {
    let parts = str.split('$'),
        regex = /([^{\}]+(?=}))/g,
        length = parts.length;
    
    for (let i = 0; i < length; i++) {
        let keyVal = parts[i].split('=');
        if (keyVal[0].trim() == attr) {
            let value = keyVal[1];
            if (value && value.match(regex)) {
                return String(value.match(regex)).trim();
            }
            break;
        }
    }
    return false;
}

function openSearch() {
    localStorage.search_term = '';
    $body.removeClass('share-on').addClass('search-on');
    setTimeout(function() {
        $('.main-search input').focus();
    }, 250);
}

function cleanSearch() {
    setTimeout(function() {
        $('.main-search input').blur().val('');
        $('.search-results').html('').removeClass('visible').parent().removeClass('loading');
    }, 250);
}

function closeSearch() {
    $('.main-search .close, .search-on .overlay-bg').on('click', function() {
        $body.removeClass('search-on');
        cleanSearch();
    });
    
    $(window).on('keydown', function(e) {
        if (27 == e.keyCode) { // ESC
            $body.removeClass('search-on');
            cleanSearch();
        }
    });
}

function closeShare() {
    $body.removeClass('share-on');
}

function openShare() {
    cleanSearch();
    $body.removeClass('search-on').addClass('share-on');
    $('.share-on .overlay-bg').on('click', function() {
        closeShare();
    });
    
    $(window).on('keydown', function(e) {
        if (27 == e.keyCode) { // ESC
            closeShare();
        }
    });
}

function navShortcuts(selector) {
    $(selector).each(function() {
        let href = $(this).attr('href');
        href && window.open(href, '_self');
    });
}

function msgError(type) {
    return '<div class="post fadeInDown" style="animation-delay:0.1s;">' + 
        (('search' != type ? '<b>Error:</b>&nbsp;' : '') + pbt.noResults) + 
        '</div>';
}

function getFeedUrl(num, type) {
    return type === 'recent' ? 
        '/search/?by-date=true&max-results=' + num + '&view=json' : 
        '/search/label/' + type + '?by-date=true&max-results=' + num + '&view=json';
}

function getPostTitle(data, options) {
    let target = data.target ? ' target="' + data.target + '"' : '',
        title = options.link !== '_self' ? 
            '<a href="' + data.post.link + '" ' + target + '>' + data.post.title + '</a>' : 
            data.post.title,
        html = '<h2 class="entry-title">' + title + '</h2>';
    return html;
}

function getPostMeta(data, options) {
    let author = pbt.postAuthor && options.author !== '_self' ? 
            '<span class="entry-author"><span class="author-name">' + data.post.author + '</span></span>' : '',
        date = pbt.postDate && options.date !== '_self' ? 
            '<span class="entry-time"><time class="published" datetime="' + 
            data.post.date.datetime + '">' + data.post.date.formatted + '</time></span>' : '',
        meta = author || date ? '<div class="entry-meta">' + (author + date) + '</div>' : '';
    return meta;
}

function getPostImage(data, options) {
    let ytImg = options.icon !== '_self' && 
            (data.type === 'youtube' || data.post.thumbnail.source === 'youtube') ? 
            '<span class="yt-img' + (options.size ? ' x' + options.size : '') + '"></span>' : '',
        img = '<img width="100%" height="315" src="' + data.post.thumbnail.src + '" loading="lazy"/>',
        target = data.target ? ' target="' + data.target + '"' : '',
        html = 'false' != options.link ? 
            '<a class="entry-thumbnail" href="' + data.post.link + '" ' + target + '>' + (img + ytImg) + '</a>' : 
            '<div class="entry-thumbnail">' + (img + ytImg) + '</div>';
    return html;
}

function getPostTag(post) {
    let tag = pbt.postCategory && post.post.category ? 
        '<span class="entry-tag">' + post.post.category + '</span>' : '';
    return tag;
}

function getPostSummary(post) {
    let summary = pbt.postSummary && post.post.summary ? 
        '<span class="entry-excerpt excerpt">' + post.post.summary + '</span>' : '';
    return summary;
}

function getPostContent(data) {
    let type = data.type,
        post = data.post,
        num = data.num,
        headline = data.headline,
        target = data.target,
        getImage = function(options = {}) {
            return getPostImage({
                type: type,
                post: post,
                target: target
            }, options);
        },
        getTitle = function(options = {}) {
            return getPostTitle({
                post: post,
                target: target
            }, options);
        },
        getMeta = function(options = {}) {
            return getPostMeta({
                post: post
            }, options);
        },
        html = '';
    
    switch (type) {
        case 'search':
            html = data.index != num ? 
                '<div class="post fadeInDown" style="animation-delay:' + (0.1 * data.index).toFixed(1) + 's;">' + 
                getImage({ size: '4' }) + 
                '<div class="entry-header">' + (getTitle() + getMeta({ author: '_self' })) + 
                '</div>' : '';
            break;
            
        case 'related':
            html = data.index != num - 1 ? 
                '<div class="post fadeInDown">' + getImage({ size: '2' }) + 
                '<div class="entry-header">' + (getTitle() + getMeta({ author: '_self' })) + 
                '</div>' : '';
    }
    
    return html;
}

function getRecentPostsData(num) {
    let response = $.ajax({
        url: getFeedUrl(num, 'recent'),
        type: 'GET',
        async: false,
        dataType: 'html',
        cache: true,
        success: function(data) {
            return data;
        }
    }).responseText;
    
    let json = JSON.parse($(response).find('#data').text()),
        posts = json.posts;
    return posts;
}

function getPosts(data) {
    let $target = data.t,
        type = data.type,
        num = data.num,
        label = data.label ? data.label : 'recent',
        id = data.id,
        link = data.link,
        headline = data.headline,
        target = data.target;
    
    $.ajax({
        url: type !== 'search' ? getFeedUrl(num, label) : link,
        type: 'GET',
        async: true,
        dataType: 'html',
        cache: true,
        beforeSend: function(xhr) {
            if (type === 'search') {
                $target.addClass('scroll').parent().parent().addClass('loading');
            } else {
                $target.html('<div class="loader"><svg viewBox="0 0 50 50"><circle stroke-width="2.8" cx="25" cy="25" fill="none" r="20" stroke="currentColor" stroke-linecap="round"></circle></svg></div>');
            }
        },
        success: function(data) {
            let html = '',
                count = 0,
                noResults = false;
            
            html = '<div class="blog-posts ' + type + '-items">';
            
            let $data = $(data).find('#data');
            if ($data.length) {
                let json = JSON.parse($data.text()),
                    posts = json.posts;
                
                if (posts) {
                    if (type == 'related') {
                        if (posts.length == 1 && label != 'recent') {
                            posts = getRecentPostsData(num);
                        }
                        
                        let length = posts.length;
                        for (let i = 0; i < length; i++) {
                            if (posts.length != 1 && json.posts[i].id == id) {
                                posts.splice(i, 1);
                                break;
                            }
                        }
                    }
                    
                    let length = posts.length;
                    for (let i = 0; i < length; i++) {
                        let post = posts[i];
                        html += getPostContent({
                            type: type,
                            index: i,
                            post: post,
                            num: num,
                            headline: headline,
                            target: target
                        });
                    }
                    
                    count = length;
                } else {
                    noResults = true;
                }
            } else {
                noResults = true;
            }
            
            html += '</div>';
            html = noResults ? msgError(type) : html;
            
            if (type === 'search') {
                $target.html(html).parent().addClass('visible').parent().addClass('loading');
                
                let $viewAll = $target.parent().find('.view-all');
                if (num < count) {
                    let viewUrl = '/search/?q=' + label + '&by-date=true&max-results=5&view=json';
                    $viewAll.length ? 
                        $viewAll.find('a').attr('href', viewUrl) : 
                        $target.parent().append('<div class="view-all"><a class="btn" href="' + viewUrl + '">' + pbt.viewAll + '</a></div>');
                } else {
                    $viewAll.remove();
                }
                
                setTimeout(function() {
                    $target.addClass('visible');
                }, 500);
            } else {
                $target.html(html);
            }
            
            if (type === 'search') {
                $target.find('.thumbnail').pbtLazy({ onScroll: false });
            } else {
                $target.find('.thumbnail').pbtLazy();
            }
        },
        error: function() {
            $target.html(msgError(type));
        }
    });
}

function getSearch($input, $results) {
    let term = $input.val(),
        trimmed = term.trim();
    
    if (trimmed != '' && trimmed != localStorage.search_term) {
        localStorage.search_term = trimmed;
        getPosts({
            t: $results,
            type: 'search',
            num: 4,
            label: trimmed,
            link: '/search/?q=' + trimmed + '&by-date=true&max-results=5'
        });
    }
}

function disqusComments(shortname) {
    let head = document.getElementsByTagName('head')[0],
        script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://' + shortname + '.disqus.com/blogger_item.js';
    head.appendChild(script);
}

function beautiAvatar(selector) {
    $(selector).attr('src', function(i, src) {
        let defaultAvatar = '//lh3.googleusercontent.com/zFdxGE77vvD2w5xHy6jkVuElKv-U9_9qLkRYK8OnbDeJPtjSZ82UPq5w6hJ-SA=s35';
        return src = src.replace('/s35', defaultAvatar)
                       .replace('/s44-rw', defaultAvatar)
                       .replace('/img/a', defaultAvatar)
                       .replace('=w72-h72-p-k-no-nu', '=s35')
                       .replace('-p-k-no-nu-rw', '');
    }).attr('alt', 'User Avatar');
}
