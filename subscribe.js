const PRO_MONTHLY_LINK = "https://buy.stripe.com/bIY2aX0vv6so4wg8ww";
const PRO_ANNUALLY_LINK = "https://buy.stripe.com/4gw7vh4LL040faUbIM"
const PRO_PLUS_MONTHLY_LINK = "https://buy.stripe.com/aEU4j5a654kg0g0dQS";
const PRO_PLUS_ANNUALLY_LINK = "https://buy.stripe.com/14k5n9fqp040bYI4gj";

document.getElementById('priceToggle').addEventListener('click', function () {
  const proPriceDiv = document.querySelector('.planItem--pro .price');
  const proButton = document.querySelector('.planItem--pro .button');
  const proPlusPriceDiv = document.querySelector('.planItem--proPlus .price');
  const proPlusButton = document.querySelector('.planItem--proPlus .button');
  const percentSavedDivs = document.querySelectorAll('.percentSaved');

  const isMonthly = proPriceDiv.textContent.includes('$4.99');
  if (isMonthly) {
    proPriceDiv.innerHTML = '$49.99<span>/ year</span>';
    proButton.href = PRO_ANNUALLY_LINK;
    proPlusButton.href = PRO_PLUS_ANNUALLY_LINK;
  } else {
    proPriceDiv.innerHTML = '$4.99<span>/ month</span>';
    proButton.href = PRO_MONTHLY_LINK;
    proPlusButton.href = PRO_PLUS_MONTHLY_LINK;
  }

  if (isMonthly) {
    proPlusPriceDiv.innerHTML = '$99.99<span>/ year</span>';
  } else {
    proPlusPriceDiv.innerHTML = '$11.99<span>/ month</span>';
  }

  if (isMonthly) {
    percentSavedDivs.forEach(function (div) {
      div.style.visibility = 'visible';
    });
  } else {
    percentSavedDivs.forEach(function (div) {
      div.style.visibility = 'hidden';
    });
  }

});
