/*!
 * Start Bootstrap - Agnecy Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
});

// Highlight the top nav as scrolling occurs
$('body').scrollspy({
    target: '.navbar-fixed-top'
});

(function($) {
    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function toNumber(value, fallback) {
        var parsed = parseFloat(value);
        return isFinite(parsed) ? parsed : fallback;
    }

    function setFallbackAlt(container, image) {
        if (image.alt && image.alt.trim()) {
            return;
        }

        var panel = container.parentElement.querySelector('.timeline-panel');
        if (!panel) {
            image.alt = 'Timeline gallery image';
            return;
        }

        var subheading = panel.querySelector('.timeline-heading .subheading');
        var date = panel.querySelector('.timeline-heading h4:not(.subheading)');
        var altParts = [];

        if (subheading && subheading.textContent.trim()) {
            altParts.push(subheading.textContent.trim());
        }

        if (date && date.textContent.trim()) {
            altParts.push(date.textContent.trim());
        }

        image.alt = altParts.length ? altParts.join(' - ') : 'Timeline gallery image';
    }

    function initTimelineZoom(container) {
        var image = container.querySelector('img');
        if (!image) {
            return;
        }

        setFallbackAlt(container, image);

        container.setAttribute('tabindex', '0');
        container.setAttribute('role', 'group');
        container.setAttribute('aria-describedby', 'timeline-zoom-help');
        container.setAttribute('aria-label', image.alt + '. Zoomable timeline image');
        container.setAttribute('title', 'Use mouse wheel or pinch to zoom. Drag to pan.');

        var state = {
            naturalWidth: 0,
            naturalHeight: 0,
            viewportWidth: 0,
            viewportHeight: 0,
            baseScale: 1,
            zoom: 1,
            minZoom: 1,
            maxZoom: 3,
            x: 0,
            y: 0,
            initialized: false
        };

        var activePointers = {};
        var dragPointerId = null;
        var pinchStartDistance = 0;
        var pinchStartZoom = 1;

        function getViewport() {
            state.viewportWidth = container.clientWidth;
            state.viewportHeight = container.clientHeight;
        }

        function clampPan() {
            var scaledWidth = state.naturalWidth * state.baseScale * state.zoom;
            var scaledHeight = state.naturalHeight * state.baseScale * state.zoom;
            var maxX = Math.max(0, (scaledWidth - state.viewportWidth) / 2);
            var maxY = Math.max(0, (scaledHeight - state.viewportHeight) / 2);

            state.x = clamp(state.x, -maxX, maxX);
            state.y = clamp(state.y, -maxY, maxY);
        }

        function render() {
            image.style.transform = 'translate(-50%, -50%) translate(' + state.x + 'px, ' + state.y + 'px) scale(' + (state.baseScale * state.zoom) + ')';
        }

        function setZoom(nextZoom, clientX, clientY) {
            var previousZoom = state.zoom;
            var next = clamp(nextZoom, state.minZoom, state.maxZoom);
            if (next === previousZoom) {
                return;
            }

            var rect = container.getBoundingClientRect();
            var focusX = typeof clientX === 'number' ? clientX - rect.left - (state.viewportWidth / 2) : 0;
            var focusY = typeof clientY === 'number' ? clientY - rect.top - (state.viewportHeight / 2) : 0;
            var ratio = next / previousZoom;

            state.x = focusX - ((focusX - state.x) * ratio);
            state.y = focusY - ((focusY - state.y) * ratio);
            state.zoom = next;

            clampPan();
            render();
        }

        function refresh() {
            getViewport();
            state.baseScale = Math.max(state.viewportWidth / state.naturalWidth, state.viewportHeight / state.naturalHeight);
            state.minZoom = Math.max(1, toNumber(image.getAttribute('data-zoom-min'), 1));
            state.maxZoom = Math.max(state.minZoom, toNumber(image.getAttribute('data-zoom-max'), 3));

            if (!state.initialized) {
                state.zoom = clamp(toNumber(image.getAttribute('data-zoom-initial'), state.minZoom), state.minZoom, state.maxZoom);
                state.initialized = true;
            } else {
                state.zoom = clamp(state.zoom, state.minZoom, state.maxZoom);
            }

            clampPan();
            render();
        }

        function pointerList() {
            var ids = Object.keys(activePointers);
            return ids.map(function(id) {
                return activePointers[id];
            });
        }

        function distance(a, b) {
            var dx = a.x - b.x;
            var dy = a.y - b.y;
            return Math.sqrt((dx * dx) + (dy * dy));
        }

        container.addEventListener('wheel', function(event) {
            event.preventDefault();
            var factor = Math.exp((-event.deltaY || 0) * 0.0015);
            setZoom(state.zoom * factor, event.clientX, event.clientY);
        }, {
            passive: false
        });

        container.addEventListener('pointerdown', function(event) {
            if (event.pointerType === 'mouse' && event.button !== 0) {
                return;
            }

            activePointers[event.pointerId] = {
                x: event.clientX,
                y: event.clientY
            };

            if (Object.keys(activePointers).length === 1) {
                dragPointerId = event.pointerId;
                container.classList.add('is-dragging');
            } else if (Object.keys(activePointers).length === 2) {
                var points = pointerList();
                pinchStartDistance = Math.max(1, distance(points[0], points[1]));
                pinchStartZoom = state.zoom;
                dragPointerId = null;
                container.classList.remove('is-dragging');
            }

            container.setPointerCapture(event.pointerId);
        });

        container.addEventListener('pointermove', function(event) {
            if (!activePointers[event.pointerId]) {
                return;
            }

            var previous = activePointers[event.pointerId];
            activePointers[event.pointerId] = {
                x: event.clientX,
                y: event.clientY
            };

            var activeCount = Object.keys(activePointers).length;
            if (activeCount === 1 && dragPointerId === event.pointerId) {
                state.x += event.clientX - previous.x;
                state.y += event.clientY - previous.y;
                clampPan();
                render();
                event.preventDefault();
                return;
            }

            if (activeCount === 2) {
                var points = pointerList();
                var newDistance = Math.max(1, distance(points[0], points[1]));
                var midpointX = (points[0].x + points[1].x) / 2;
                var midpointY = (points[0].y + points[1].y) / 2;
                setZoom(pinchStartZoom * (newDistance / pinchStartDistance), midpointX, midpointY);
                event.preventDefault();
            }
        }, {
            passive: false
        });

        function releasePointer(event) {
            delete activePointers[event.pointerId];
            if (Object.keys(activePointers).length === 1) {
                dragPointerId = parseInt(Object.keys(activePointers)[0], 10);
                container.classList.add('is-dragging');
            } else {
                dragPointerId = null;
                container.classList.remove('is-dragging');
            }
        }

        container.addEventListener('pointerup', releasePointer);
        container.addEventListener('pointercancel', releasePointer);
        container.addEventListener('pointerleave', releasePointer);

        container.addEventListener('keydown', function(event) {
            var key = event.key;
            if (key === '+' || key === '=' || key === '-' || key === '_') {
                event.preventDefault();
                setZoom(state.zoom * (key === '+' || key === '=' ? 1.1 : 0.9));
                return;
            }

            var panStep = 12;
            if (key === 'ArrowLeft') {
                state.x += panStep;
            } else if (key === 'ArrowRight') {
                state.x -= panStep;
            } else if (key === 'ArrowUp') {
                state.y += panStep;
            } else if (key === 'ArrowDown') {
                state.y -= panStep;
            } else {
                return;
            }

            event.preventDefault();
            clampPan();
            render();
        });

        function onReady() {
            state.naturalWidth = image.naturalWidth || 1;
            state.naturalHeight = image.naturalHeight || 1;
            image.style.width = state.naturalWidth + 'px';
            image.style.height = state.naturalHeight + 'px';
            refresh();
        }

        if (image.complete && image.naturalWidth) {
            onReady();
        } else {
            image.addEventListener('load', onReady);
        }

        window.addEventListener('resize', refresh);
    }

    $(function() {
        $('.timeline .timeline-image').each(function() {
            initTimelineZoom(this);
        });
    });
})(jQuery);
