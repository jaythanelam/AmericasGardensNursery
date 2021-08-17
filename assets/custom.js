 jQuery(document).ready(function() {
  jQuery(".accordion-button").on("click", function() {
    if ($(this).hasClass("active")) {
      jQuery(this).removeClass("active");
      jQuery(this).next(".accordion-panel").slideUp(200);
    } else {
      jQuery(".accordion-button").removeClass("active");
      jQuery(this).addClass("active");
      jQuery(".accordion-panel").slideUp(200);
      jQuery(this).next(".accordion-panel").slideDown(200);
    }
  });
});