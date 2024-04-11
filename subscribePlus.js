const PRO_PLUS_MONTHLY_LINK = "https://buy.stripe.com/aEU4j5a654kg0g0dQS";
const PRO_PLUS_ANNUALLY_LINK = "https://buy.stripe.com/14k5n9fqp040bYI4gj";

function getQueryParamValue(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function appendPreferredEmailToLinks() {
  const preferredEmail = getQueryParamValue('prefilled_email');
  if (preferredEmail) {
    const emailQueryParam = `?prefilled_email=${encodeURIComponent(preferredEmail)}`;
    document.querySelector('.planItem--proPlus .button').href = PRO_PLUS_MONTHLY_LINK + emailQueryParam;
  }
}

appendPreferredEmailToLinks();

document.getElementById('priceToggle').addEventListener('click', function () {
  const proPlusPriceDiv = document.querySelector('.planItem--proPlus .price');
  const proPlusButton = document.querySelector('.planItem--proPlus .button');
  const percentSavedDivs = document.querySelectorAll('.percentSaved');

  const isMonthly = proPlusPriceDiv.textContent.includes('$11.99');

  const preferredEmail = getQueryParamValue('prefilled_email');
  const emailQueryParam = preferredEmail ? `?prefilled_email=${encodeURIComponent(preferredEmail)}` : '';

  if (isMonthly) {
    proPlusButton.href = PRO_PLUS_ANNUALLY_LINK + emailQueryParam;
  } else {
    proPlusButton.href = PRO_PLUS_MONTHLY_LINK + emailQueryParam;
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
