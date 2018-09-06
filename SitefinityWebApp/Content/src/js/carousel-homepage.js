$(document).ready(function () {
  if ($('.home__hero').length) {
    $('.home__hero > div').slick(
      {
        arrows: false,
        dots: true
      }
    )
  }
  if ($('.featured-products').length) {
    $('.featured-products').slick(
      {
        mobileFirst: true,
        responsive: [
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 2
            }
          },
          {
            breakpoint: 992,
            settings: "unslick"
          }
        ]
      }
    )
  }
})