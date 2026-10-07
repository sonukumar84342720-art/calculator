const display =
    document.getElementById("display");

const previousDisplay =
    document.getElementById("previous-display");

const statusText =
    document.getElementById("status");


// ============================================
// ADD NUMBER
// ============================================

function addNumber(number) {

    // If error is displayed
    if (
        display.value === "Error" ||
        display.value === "Server Error" ||
        display.value === "Cannot divide by zero." ||
        display.value === "Invalid calculation."
    ) {

        display.value = "";

    }


    // If result was already calculated
    // and user enters a new number
    if (display.dataset.result === "true") {

        display.value = "";

        previousDisplay.textContent = "";

        display.dataset.result = "false";

    }


    display.value += number;

}


// ============================================
// ADD OPERATOR
// ============================================

function addOperator(operator) {

    if (display.value === "") {

        // Allow negative number
        if (operator === "-") {

            display.value = "-";

        }

        return;
    }


    // If result was displayed
    if (display.dataset.result === "true") {

        display.dataset.result = "false";

    }


    const lastCharacter =
        display.value.slice(-1);


    // Prevent duplicate operators

    if (
        lastCharacter === "+" ||
        lastCharacter === "-" ||
        lastCharacter === "*" ||
        lastCharacter === "/"
    ) {

        display.value =
            display.value.slice(0, -1)
            + operator;

        return;

    }


    display.value += operator;

}


// ============================================
// DECIMAL
// ============================================

function addDecimal() {

    const expression =
        display.value;


    // Start with 0.
    if (expression === "") {

        display.value = "0.";

        return;

    }


    // Find current number after operator

    const parts =
        expression.split(/[+\-*/]/);

    const currentNumber =
        parts[parts.length - 1];


    // Don't allow multiple decimals

    if (currentNumber.includes(".")) {

        return;

    }


    display.value += ".";

}


// ============================================
// PERCENTAGE
// ============================================

function percentage() {

    if (display.value === "") {

        return;

    }


    const expression =
        display.value;


    // Find last number

    const match =
        expression.match(
            /(\d+(\.\d+)?)$/
        );


    if (!match) {

        return;

    }


    const number =
        parseFloat(match[0]);


    const percentageValue =
        number / 100;


    display.value =
        expression.slice(
            0,
            match.index
        ) + percentageValue;

}


// ============================================
// C - CLEAR CURRENT ENTRY
// ============================================

function clearEntry() {

    display.value = "";

}


// ============================================
// AC - ALL CLEAR
// ============================================

function allClear() {

    display.value = "";

    previousDisplay.textContent = "";

    display.dataset.result = "false";

    statusText.textContent =
        "Backend: Connected";

}


// ============================================
// BACKSPACE
// ============================================

function backspace() {

    if (
        display.value === "Error" ||
        display.value === "Server Error" ||
        display.value === "Cannot divide by zero." ||
        display.value === "Invalid calculation."
    ) {

        allClear();

        return;

    }


    display.value =
        display.value.slice(0, -1);

}


// ============================================
// CALCULATE
// ============================================

async function calculate() {

    const expression =
        display.value.trim();


    if (expression === "") {

        return;

    }


    const lastCharacter =
        expression.slice(-1);


    // Incomplete expression

    if (
        lastCharacter === "+" ||
        lastCharacter === "-" ||
        lastCharacter === "*" ||
        lastCharacter === "/" ||
        lastCharacter === "."
    ) {

        statusText.textContent =
            "Complete the calculation first.";

        return;

    }


    try {

        statusText.textContent =
            "Calculating...";


        const response =
            await fetch(
                "/calculate",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        expression:
                            expression
                    })

                }
            );


        const data =
            await response.json();


        if (data.success) {

            previousDisplay.textContent =
                expression + " =";


            display.value =
                formatResult(
                    data.result
                );


            display.dataset.result =
                "true";


            statusText.textContent =
                "Backend: Connected";


            loadHistory();

        }


        else {

            display.value =
                data.error;

            statusText.textContent =
                "Calculation Error";

        }


    }

    catch (error) {

        console.error(error);


        display.value =
            "Server Error";


        statusText.textContent =
            "Backend: Disconnected";

    }

}


// ============================================
// FORMAT RESULT
// ============================================

function formatResult(result) {

    if (typeof result === "number") {

        // Integer
        if (Number.isInteger(result)) {

            return result.toString();

        }


        // Decimal
        return parseFloat(
            result.toFixed(10)
        ).toString();

    }


    return result;

}


// ============================================
// LOAD HISTORY
// ============================================

async function loadHistory() {

    try {

        const response =
            await fetch("/history");


        const data =
            await response.json();


        const historyList =
            document.getElementById(
                "history-list"
            );


        if (
            !data.history ||
            data.history.length === 0
        ) {

            historyList.innerHTML =
                `
                <p class="empty-history">
                    No calculations yet
                </p>
                `;

            return;

        }


        historyList.innerHTML = "";


        // Latest first

        const history =
            [...data.history].reverse();


        history.forEach(
            function(item) {

                const historyItem =
                    document.createElement(
                        "div"
                    );


                historyItem.className =
                    "history-item";


                const expression =
                    document.createElement(
                        "span"
                    );


                expression.textContent =
                    item.expression;


                const result =
                    document.createElement(
                        "strong"
                    );


                result.textContent =
                    "= " +
                    formatResult(
                        item.result
                    );


                historyItem.appendChild(
                    expression
                );


                historyItem.appendChild(
                    result
                );


                historyList.appendChild(
                    historyItem
                );

            }
        );


    }

    catch (error) {

        console.error(
            "History error:",
            error
        );

    }

}


// ============================================
// CLEAR HISTORY
// ============================================

async function clearHistory() {

    try {

        await fetch(
            "/history/clear",
            {
                method: "DELETE"
            }
        );


        loadHistory();

    }

    catch (error) {

        console.error(
            "Could not clear history:",
            error
        );

    }

}


// ============================================
// KEYBOARD SUPPORT
// ============================================

document.addEventListener(
    "keydown",
    function(event) {

        const key =
            event.key;


        // Numbers

        if (
            key >= "0" &&
            key <= "9"
        ) {

            addNumber(key);

            return;

        }


        // Decimal

        if (key === ".") {

            addDecimal();

            return;

        }


        // Operators

        if (
            key === "+" ||
            key === "-" ||
            key === "*" ||
            key === "/"
        ) {

            addOperator(key);

            return;

        }


        // Percentage

        if (key === "%") {

            percentage();

            return;

        }


        // Enter

        if (
            key === "Enter" ||
            key === "="
        ) {

            event.preventDefault();

            calculate();

            return;

        }


        // Backspace

        if (key === "Backspace") {

            backspace();

            return;

        }


        // Escape = AC

        if (key === "Escape") {

            allClear();

            return;

        }

    }
);


// ============================================
// LOAD HISTORY WHEN PAGE OPENS
// ============================================

loadHistory();