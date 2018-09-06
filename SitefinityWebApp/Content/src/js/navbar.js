var scrollTimer, lastScrollFireTime = 0;

$(window).on('scroll', function () {

  var minScrollTime = 100;
  var now = new Date().getTime();

  function processScroll() {
    if (!$(window).scrollTop() && $('header').hasClass('short')) {
      $('header').removeClass('short')
    } else if ($(window).scrollTop() && !$('header').hasClass('short')) {
      $('header').addClass('short')
    }
  }

  if (!scrollTimer) {
    if (now - lastScrollFireTime > (3 * minScrollTime)) {
      processScroll();   // fire immediately on first scroll
      lastScrollFireTime = now;
    }
    scrollTimer = setTimeout(function () {
      scrollTimer = null;
      lastScrollFireTime = new Date().getTime();
      processScroll();
    }, minScrollTime);
  }
});