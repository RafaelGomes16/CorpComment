//GLOBAL
const MAXCHARS = 150;
const BASE_API_URL = "https://bytegrad.com/course-assets/js/1/api/feedbacks";

const textareaEl = document.querySelector(".form__textarea");
const counterEl = document.querySelector(".counter");
const formEl = document.querySelector(".form");
const feedbackListEl = document.querySelector(".feedbacks");
const submitBtnEl = document.querySelector(".submit-btn");
const spinnerEl = document.querySelector(".spinner");
const hashtagListEl = document.querySelector('.hashtags')



const renderFeedbackItem = feedbackItem => {
    //new feedback item
    const feedbackItemHtml = `
    <li class="feedback">
    <button class="upvote">
        <i class="fa-solid fa-caret-up upvote__icon"></i>
        <span class="upvote__count">${feedbackItem.upvoteCount}</span>
    </button>
    <section class="feedback__badge">
        <p class="feedback__letter">${feedbackItem.badgeLetter}</p>
    </section>
    <div class="feedback__content">
        <p class="feedback__company">${feedbackItem.company}</p>
        <p class="feedback__text">${feedbackItem.text}</p>
    </div>
    <p class="feedback__date">${feedbackItem.daysAgo === 0 ? "NEW" : `${feedbackItem.daysAgo} d`}</p>
    </li>
    `;

    //insert new feedback item
    feedbackListEl.insertAdjacentHTML("beforeend", feedbackItemHtml);
}

//COUNTER
const inputHandler = () => {
    //number of chars
    const numberOfChars = MAXCHARS;
    //number chars typed
    const nrCharsTyped = textareaEl.value.length;
    //calculate
    const charsLeft = numberOfChars - nrCharsTyped;
    //final result
    counterEl.textContent = charsLeft;
};
textareaEl.addEventListener("input", inputHandler);

//FORM COMPONENT

const showVisualIndicator = (textCheck) => {
    const className = textCheck === "valid" ? "form--valid" : "form--invalid";

    //show valid indicator
    formEl.classList.add(className);
    //remove visual indicator
    setTimeout(() => {
        formEl.classList.remove(className);
    }, 2000);
};

const submitHandler = (event) => {
    //prevent default browser action (refresh problem)
    event.preventDefault();
    //get text
    const text = textareaEl.value;
    //validation text (# and length)
    if (text.includes("#") && text.length >= 5) {
        showVisualIndicator("valid");
    } else {
        showVisualIndicator("invalid");
        //focus textarea
        textareaEl.focus();
        //stop focus
        return;
    }

    //extract other info
    const hashtag = text.split(" ").find((word) => word.includes("#"));
    const company = hashtag.substring(1);
    const badgeLetter = company.substring(0, 1).toUpperCase();
    const upvoteCount = 0;
    const daysAgo = 0;

    //create feedback item in list
    const feedbackItem = {
        upvoteCount: upvoteCount,
        company: company,
        badgeLetter: badgeLetter,
        daysAgo: daysAgo,
        text: text
    }

    //render feedbacks items 
    renderFeedbackItem(feedbackItem);

    //send feedback item to server
    fetch(`${BASE_API_URL}/feedbacks`, {
        method: 'POST',
        body: JSON.stringify(feedbackItem),
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if(!response.ok){
            console.log('Something went wrong')
            return;
        }

        console.log('Success Submit')
    }).catch(error => console.log(error));

    //clear textarea
    textareaEl.value = '';

    //blur button
    submitBtnEl.blur();

    //reset counter
    counterEl.textContent = MAXCHARS;
};

formEl.addEventListener("submit", submitHandler);

// -- FEEDBACK LIST COMPONENT --
const clickHandler = event => {
    // get clicked HTML-element
    const clickedEl = event.target;

    // determine if user intended to upvote or expand
    const upvoteIntention = clickedEl.className.includes('upvote');

    // run the appropriate logic
    if (upvoteIntention) {
        // get the closest upvote button
        const upvoteBtnEl = clickedEl.closest('.upvote');

        // disable upvote button (prevent double-clicks, spam)
        upvoteBtnEl.disabled = true;

        // select the upvote count element within the upvote button
        const upvoteCountEl = upvoteBtnEl.querySelector('.upvote__count');

        // get currently displayed upvote count as number (+)
        let upvoteCount = +upvoteCountEl.textContent;

        // set upvote count incremented by 1
        upvoteCountEl.textContent = ++upvoteCount;
    } else {
        // expand the clicked feedback item
        clickedEl.closest('.feedback').classList.toggle('feedback--expand');
    }
};

feedbackListEl.addEventListener('click', clickHandler);


fetch(`${BASE_API_URL}/feedbacks`)
    .then((response) => response.json())
    .then((data) => {
        for (let i = 1; i < data.feedbacks.length; i++) {
        const feedbackItem = data.feedbacks[i];
        //remove spinner
        spinnerEl.remove();
        //itenerate over each El in the array
        renderFeedbackItem(feedbackItem);
        };
    })
    .catch((error) => {
        feedbackListEl.textContent = `Failed to load Feedbacks. Error message: ${error.message}`;
    });
 
//HASHTAG LIST COMPONENT

const clickHandler2 = event => {
    //get clicked element 
    const clickedEl = event.target;

    //stop function if click happened in list, but outside buttons
    if (clickedEl.className === 'hashtags') return;

    //extract company name
    const companyNameFromHashtag = clickedEl.textContent.substring(1).toLowerCase().trim();

    //iterate over each feedback item in the list
    feedbackListEl.childNodes.forEach(childNode => {
        //stop this iteration if is a child node
        if(childNode.nodeType === 3) return;

        //extract company name
        const companyNameFromFeedbackItem = childNode.querySelector('.feedback__company').textContent.toLowerCase().trim();

        //remove feedback item from list if names are not equal
        if(companyNameFromHashtag !== companyNameFromFeedbackItem){
            childNode.remove();
        }
    });
}

hashtagListEl.addEventListener('click', clickHandler2)