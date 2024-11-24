// name_claim.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registrationForm');
    const messageDiv = document.getElementById('message');
    const usernameInput = document.getElementById('username');
    const domainSelect = document.getElementById('domain');
    const didInput = document.getElementById('did');
    const loadingSpinner = document.getElementById('loading-spinner');
    const usernameStatus = document.getElementById('username-status');
    const didStatus = document.getElementById('did-status');
    const didInfoBtn = document.getElementById('did-info-btn');
    const popupModal = document.getElementById('popup-modal');
    const closePopupBtn = document.getElementById('close-popup');
    const submitButton = document.getElementById('submit-btn');
    const emailInput = document.getElementById('email'); 
    const emailStatus = document.getElementById('email-status'); 
    const helpBtn = document.getElementById('help-btn');
    const faqModal = document.getElementById('faq-modal');
    const closeFaqBtn = document.getElementById('close-faq');
    const faqQuestionList = document.getElementById('faq-question-list');
    const faqAnswerContent = document.getElementById('faq-answer-content');

    // Code to populate the scrolling list
    const registrantList = document.getElementById('registrant-list');

    fetch('/api/public/registrants')
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                const registrants = result.data;
                // Duplicate the list to make seamless scrolling
                const combinedRegistrants = registrants.concat(registrants);

                // Create list items
                combinedRegistrants.forEach(registrant => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = `https://bsky.app/profile/${registrant.did}`;
                    a.target = '_blank'; // Open in new tab
                    a.textContent = `${registrant.username}`;//.${registrant.domain}
                    li.appendChild(a);
                    registrantList.appendChild(li);
                });
                // After populating the list, set up the auto-scroll
                setupAutoScroll();
                // Jump to random position
                jumpToRandomPosition();
            }
        })
        .catch(error => {
            console.error('Error fetching registrants:', error);
        });

    function setupAutoScroll() {
        const listHeight = registrantList.scrollHeight / 2; // Since we duplicated the list
        let currentPosition = 0;
        const scrollSpeed = 0.25; // pixels per frame

        function scrollList() {
            currentPosition += scrollSpeed;
            if (currentPosition >= listHeight) {
                currentPosition = 0;
            }
            registrantList.style.transform = `translateY(-${currentPosition}px)`;
            requestAnimationFrame(scrollList);
        }

        requestAnimationFrame(scrollList);
    }

    function jumpToRandomPosition() {
        const listHeight = registrantList.scrollHeight / 2;
        const randomPosition = Math.random() * listHeight;
        registrantList.style.transform = `translateY(-${randomPosition}px)`;
    }

    const faqData = [
        {
            question: "What even is this?",
            answer: `<p>Since i own so many Domains that are useable for Bluesky Handles, i would like to share access to them here :D. </p><p>If you have any questions, need help or would just like to chat, send me an email to <strong>YOUR_EMAIL_HERE</strong>!</p>`
        },
        {
            question: "What is a DID?",
            answer: `<p>A Decentralized Identifier (DID) is a unique identifier that allows for verifiable, decentralized digital identity. It's used in Bluesky to point your custom handle to your account.</p>
            <p>To get your DID:</p>
            <ol>
                <li>Open your Bluesky app.</li>
                <li>Go to <strong>Settings</strong> > <strong>Change Handle</strong>.</li>
                <li>Select <strong>I have my own domain</strong>.</li>
                <li>Copy the provided DID value.</li>
            </ol>`
        },
        {
            question: "How long does it take to get my handle?",
            answer: `<p>After registration, it may take up to 1 day for your handle to be verified and set up. We will send you an email once it's completed.</p>
            <p><h6>This might sound dumb, but at this point in time i manually register each user.</h6></p>`
        },
        {
            question: "What is a 'Pure' Handle?",
            answer: `<p>A Pure handle is a type of handle that Consists of a famous person/objects name, such as 'Lucario' or 'Mew'</p><p></p>To make sure that people don't claim these types of handles for the sake of it, i will manually inspect your profile before verifying that type of handle.</p><p>I will not detail how to design your profile to increase the chance of verifying such handle. Just be yourself!`
        },
        {
            question: "What do i do after registering?",
            answer: `<p>After you have successfully registered, you will recieve an email from me, with further instructions, if required!</p><p>You can check your Handle's Status at all times at <a href="https://bsky-debug.app/handle" target="_blank">here!</p>`
        },
        {
            question: "I recieved an error, what do i do?",
            answer: `<p>If you recieve any kind of error, please message me immediately at <strong>YOUR_EMAIL_HERE</strong>.</p>`
        },
        {
            question: "Can I change my handle later?",
            answer: `<p>Currently, unlinking and changing handles is not supported through this interface. Please contact us at <a href="mailto:YOUR_EMAIL_HERE">YOUR_EMAIL_HERE</a> or message @furofloof on Discord for assistance.</p>
            <p><strong>You can at all times change your handle in Bluesky. Simply Change your handle via the Default Method.</strong></p>`
        },
        {
            question: "Why do I need to provide my email?",
            answer: `<p>Your email is used to notify you when your handle setup is complete.</p>`
        },
        {
            question: "Is there a cost associated with getting a handle?",
            answer: `<p>No, getting a handle through this service is free of charge.</p>`
        },
        {
            question: "PRIVACY NOTICE",
            answer: `<p>We Share absolutely ZERO Data you generate. Everything you provide when using my service stays on my mashine.</p>
            <p>If you still have concearns, reach out to me at <strong>furothelucario@gmail.com</strong>!</p>`
        }
    ];

    function populateFaqQuestions() {
        faqData.forEach((item, index) => {
            const li = document.createElement('li');
            li.textContent = item.question;
            li.dataset.index = index;
            faqQuestionList.appendChild(li);
        });
    }

    faqQuestionList.addEventListener('click', (event) => {
        if (event.target && event.target.nodeName === "LI") {
            const index = event.target.dataset.index;
            const selectedFaq = faqData[index];
            faqAnswerContent.innerHTML = `<h2>${selectedFaq.question}</h2>${selectedFaq.answer}`;
        }
    });

    helpBtn.addEventListener('click', () => {
        faqModal.classList.remove('hidden');
    });

    closeFaqBtn.addEventListener('click', () => {
        faqModal.classList.add('hidden');
    });

    window.addEventListener('click', (event) => {
        if (event.target === faqModal) {
            faqModal.classList.add('hidden');
        }
    });

    populateFaqQuestions();



    function setDefaultDomain() {
        const domainSelect = document.getElementById('domain');
        const hostname = window.location.hostname;
        // Split the hostname into parts
        const hostParts = hostname.split('.');
        let secondLevelDomain = '';

        // Check if hostname has at least two parts
        if (hostParts.length >= 2) {
            // Get the second-level domain (e.g., 'pmd' from 'pmd.social')
            secondLevelDomain = hostParts[hostParts.length - 2];
        }

        // List of allowed second-level domains
        const allowedDomains = ['pmd', 'lucario', 'renamon', 'riolu'];

        if (allowedDomains.includes(secondLevelDomain)) {
            // Construct the domain value (e.g., 'pmd.social')
            const domainValue = `${secondLevelDomain}.social`;

            // Check if the domain value exists in the dropdown options
            const options = Array.from(domainSelect.options);
            const matchingOption = options.find(option => option.value === domainValue);

            if (matchingOption) {
                // Set the default selected option
                domainSelect.value = domainValue;
            }
        }
    }

    // Call the function to set the default domain
    setDefaultDomain();


    let typingTimer;
    const typingDelay = 1000;

    let didTypingTimer;
    const didTypingDelay = 1000; 

  
    usernameInput.addEventListener('input', () => {
        clearTimeout(typingTimer);
        usernameStatus.textContent = '';
        if (usernameInput.value.trim().length >= 3) {
            loadingSpinner.classList.remove('hidden');
            typingTimer = setTimeout(checkUsernameAvailability, typingDelay);
        } else {
            loadingSpinner.classList.add('hidden');
        }
    });

    function checkUsernameAvailability() {
        const username = usernameInput.value.trim();
        const domain = domainSelect.value;

        if (!username || !domain) {
            loadingSpinner.classList.add('hidden');
            return;
        }

        const handle = `${username}.${domain}`;

        fetch(`/api/getDataByHandle/${encodeURIComponent(handle)}`)
            .then(response => response.json())
            .then(result => {
                loadingSpinner.classList.add('hidden');
                if (result.success) {
                    usernameStatus.textContent = 'Handle is already taken.';
                    usernameStatus.style.color = '#FF4136';
                } else {
                    usernameStatus.textContent = 'Handle is available!';
                    usernameStatus.style.color = '#2ECC40';
                }
            })
            .catch(error => {
                loadingSpinner.classList.add('hidden');
                console.error('Error:', error);
                usernameStatus.textContent = 'Error checking availability.';
                usernameStatus.style.color = '#FF4136';
            });
    }

    didInput.addEventListener('input', () => {
        clearTimeout(didTypingTimer);
        didStatus.textContent = '';
        if (didInput.value.trim().length > 0) {
            didTypingTimer = setTimeout(checkDidAvailability, didTypingDelay);
        }
    });

    function checkDidAvailability() {
        const did = didInput.value.trim();

        if (!did) {
            return;
        }

        fetch(`/api/getDataByDid/${encodeURIComponent(did)}`)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    didStatus.textContent = 'You may only occupy one handle per DID, since unlinking has not been added yet. Please message @furofloof on Discord or send an email to YOUR_EMAIL_HERE for further assistance.';
                    didStatus.style.color = '#FF4136';
                    submitButton.disabled = true;
                } else {
                    didStatus.textContent = '';
                    submitButton.disabled = false;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                didStatus.textContent = 'Error checking DID.';
                didStatus.style.color = '#FF4136';
            });
    }

    emailInput.addEventListener('input', () => {
        emailStatus.textContent = '';
        const email = emailInput.value.trim();
        if (email.length > 0 && !validateEmail(email)) {
            emailStatus.textContent = 'Invalid email format.';
            emailStatus.style.color = '#FF4136';
            submitButton.disabled = true;
        } else {
            emailStatus.textContent = '';
            emailStatus.style.color = '';
            submitButton.disabled = false;
        }
    });

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        messageDiv.textContent = '';
        usernameStatus.textContent = '';
        didStatus.textContent = '';
        emailStatus.textContent = '';

        const username = usernameInput.value.trim();
        const domain = domainSelect.value;
        const did = didInput.value.trim();
        const email = emailInput.value.trim();
        const captchaToken = grecaptcha.getResponse();

        if (!username || !domain || !did || !email) {
            messageDiv.textContent = 'Please fill in all required fields.';
            return;
        }

        if (username.length < 3) {
            messageDiv.textContent = 'Username must be at least 3 characters long.';
            return;
        }

        if (!validateEmail(email)) {
            messageDiv.textContent = 'Please enter a valid email address.';
            return;
        }

        if (!captchaToken) {
            messageDiv.textContent = 'Please complete the captcha verification.';
            return;
        }

        loadingSpinner.classList.remove('hidden');

        const data = {
            username,
            domain,
            did,
            email,
            captchaToken
        };

        fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                loadingSpinner.classList.add('hidden');
                if (result.success) {
                    messageDiv.innerHTML = `Registration successful!<br><p>You can check your Handle's Status <a href="https://bsky-debug.app/handle" target="_blank">here!</a></p> <p>To Apply your handle: <strong>Open settings > Change Handle > I have my own domain > Enter your full handle into the text box> Click "Verify DNS Record" > Press Save on the Top Right.</strong></p>`;
                    messageDiv.style.color = '#2ECC40';
                    form.reset();
                    grecaptcha.reset(); 
                    form.style.display = 'none';
                } else {
                    messageDiv.textContent = result.message;
                    messageDiv.style.color = '#FF4136';
                    grecaptcha.reset(); 
                }
            })
            .catch(error => {
                loadingSpinner.classList.add('hidden');
                console.error('Error:', error);
                messageDiv.textContent = 'An error occurred during registration.';
                messageDiv.style.color = '#FF4136';
                grecaptcha.reset();
            });
    });


    didInfoBtn.addEventListener('click', () => {
        popupModal.classList.remove('hidden');
    });

    closePopupBtn.addEventListener('click', () => {
        popupModal.classList.add('hidden');
    });

    window.addEventListener('click', (event) => {
        if (event.target === popupModal) {
            popupModal.classList.add('hidden');
        }
    });
});
