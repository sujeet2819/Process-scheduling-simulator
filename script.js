let priorityPreference = 1; //priority preferences change
// Toggle button event to switch between high and low priority preferences
document.getElementById("priority-toggle-btn").onclick = () => {
    let currentPriorityPreference = document.getElementById("priority-preference").innerText;
    // Switch displayed priority text between "high" and "low"
    if (currentPriorityPreference == "high") {
        document.getElementById("priority-preference").innerText = "low";
    } else {
        document.getElementById("priority-preference").innerText = "high";
    }
    priorityPreference *= -1; // Flip priority preference multiplier for sorting
};

let selectedAlgorithm = document.getElementById('algo');

// Shows or hides the time quantum input field depending on whether Round Robin is selected
function checkTimeQuantumInput() {
    let timequantum = document.querySelector("#time-quantum").classList;
    if (selectedAlgorithm.value == 'rr') {
        timequantum.remove("hide"); // Show input if Round Robin
    } else {
        timequantum.add("hide"); // Hide otherwise
    }
}

// Shows or hides priority input cells based on selected scheduling algorithm
function checkPriorityCell() {
    let prioritycell = document.querySelectorAll(".priority");
    if (selectedAlgorithm.value == "pnp" || selectedAlgorithm.value == "pp") {
        prioritycell.forEach((element) => {
            element.classList.remove("hide"); // Show priority for priority-based algorithms
        });
    } else {
        prioritycell.forEach((element) => {
            element.classList.add("hide"); // Hide priority input otherwise
        });
    }
}

// Update UI when algorithm selection changes
selectedAlgorithm.onchange = () => {
    checkTimeQuantumInput(); // Show/hide time quantum input
    checkPriorityCell();      // Show/hide priority cells
};

// Validates numeric input fields for arrival time (min 0) and others (min 1)
function inputOnChange() {
    let inputs = document.querySelectorAll('input');
    inputs.forEach((input) => {
        if (input.type == 'number') {
            input.onchange = () => {
                let inputVal = Number(input.value);
                let isInt = Number.isInteger(inputVal);
                // Arrival time and context switch can be zero or greater
                if (input.parentNode.classList.contains('arrival-time') || input.id == 'context-switch') {
                    if (!isInt || (isInt && inputVal < 0)) {
                        input.value = 0; // Reset to 0 if invalid
                    } else {
                        input.value = inputVal; // Valid value
                    }
                } else { 
                    // Other numeric inputs must be integer >= 1
                    if (!isInt || (isInt && inputVal < 1)) {
                        input.value = 1; // Reset to 1 if invalid
                    } else {
                        input.value = inputVal; // Valid value
                    }
                }
            }
        }
    });
}
inputOnChange(); // Initialize input validation

let process = 1; // Keeps track of number of processes

// Calculates greatest common divisor of two numbers (helper for LCM)
function gcd(x, y) {
    while (y) {
        let t = y;
        y = x % y;
        x = t;
    }
    return x;
}

// Calculates least common multiple of two numbers
function lcm(x, y) {
    return (x * y) / gcd(x, y);
}

// Calculates LCM of burst time cells count across all processes to maintain table layout
function lcmAll() {
    let result = 1;
    for (let i = 0; i < process; i++) {
        // Each process has a row of burst time cells, get their length to calculate LCM
        result = lcm(result, document.querySelector(".main-table").rows[2 * i + 2].cells.length);
    }
    return result;
}

// Updates colspan attributes in the table so burst times occupy correct widths according to LCM
function updateColspan() {
    let totalColumns = lcmAll(); // Total number of columns all rows will be expanded to
    let processHeading = document.querySelector("thead .process-time");
    processHeading.setAttribute("colspan", totalColumns); // Update header colspan accordingly
    let processTimes = [];
    let table = document.querySelector(".main-table");

    // Collect burst time cell counts for each process
    for (let i = 0; i < process; i++) {
        let row = table.rows[2 * i + 2].cells;
        processTimes.push(row.length);
    }
    // Adjust colspan for both CPU/IO heading and input rows for each process burst segment
    for (let i = 0; i < process; i++) {
        let row1 = table.rows[2 * i + 1].cells; // Header row for CPU/IO labels
        let row2 = table.rows[2 * i + 2].cells; // Input row with burst time values
        for (let j = 0; j < processTimes[i]; j++) {
            row1[j + 3].setAttribute("colspan", totalColumns / processTimes[i]);
            row2[j].setAttribute("colspan", totalColumns / processTimes[i]);
        }
    }
}

// Adds event listeners to add (+) and remove (-) buttons for adding/removing IO and CPU burst time pairs per process
function addremove() {
    let processTimes = [];
    let table = document.querySelector(".main-table");
    for (let i = 0; i < process; i++) {
        let row = table.rows[2 * i + 2].cells;
        processTimes.push(row.length);
    }
    let addbtns = document.querySelectorAll(".add-process-btn");
    for (let i = 0; i < process; i++) {
        addbtns[i].onclick = () => {
            let table = document.querySelector(".main-table");
            let row1 = table.rows[2 * i + 1];
            let row2 = table.rows[2 * i + 2];
            // Insert cells representing IO and CPU burst times with inputs for new burst segments
            let newcell1 = row1.insertCell(processTimes[i] + 3);
            newcell1.innerHTML = "IO";
            newcell1.classList.add("process-time", "io", "process-heading");
            let newcell2 = row2.insertCell(processTimes[i]);
            newcell2.innerHTML = '<input type="number" min="1" step="1" value="1">';
            newcell2.classList.add("process-time", "io", "process-input");
            let newcell3 = row1.insertCell(processTimes[i] + 4);
            newcell3.innerHTML = "CPU";
            newcell3.classList.add("process-time", "cpu", "process-heading");
            let newcell4 = row2.insertCell(processTimes[i] + 1);
            newcell4.innerHTML = '<input type="number" min="1" step="1" value="1">';
            newcell4.classList.add("process-time", "cpu", "process-input");
            processTimes[i] += 2;
            updateColspan(); // Update colspan to reflect new cells
            inputOnChange(); // Reapply input validation bindings
        };
    }
    let removebtns = document.querySelectorAll(".remove-process-btn");
    for (let i = 0; i < process; i++) {
        removebtns[i].onclick = () => {
            if (processTimes[i] > 1) { // Only allow removal if more than 1 burst segment exists
                let table = document.querySelector(".main-table");
                processTimes[i]--;
                let row1 = table.rows[2 * i + 1];
                row1.deleteCell(processTimes[i] + 3);
                let row2 = table.rows[2 * i + 2];
                row2.deleteCell(processTimes[i]);
                processTimes[i]--;
                table = document.querySelector(".main-table");
                row1 = table.rows[2 * i + 1];
                row1.deleteCell(processTimes[i] + 3);
                row2 = table.rows[2 * i + 2];
                row2.deleteCell(processTimes[i]);
                updateColspan(); // Update colspan after removal
            }
        };
    }
}
addremove(); // Initialize add/remove event listeners

// Adds a new process row in the table with default values and input fields
function addProcess() {
    process++; // Increment total processes count
    let rowHTML1 = `
                          <td class="process-id" rowspan="2">P${process}</td>
                          <td class="priority hide" rowspan="2"><input type="number" min="1" step="1" value="1"></td>
                          <td class="arrival-time" rowspan="2"><input type="number" min="0" step="1" value="0"> </td>
                          <td class="process-time cpu process-heading" colspan="">CPU</td>
                          <td class="process-btn"><button type="button" class="add-process-btn">+</button></td>
                          <td class="process-btn"><button type="button" class="remove-process-btn">-</button></td>
                      `;
    let rowHTML2 = `
                           <td class="process-time cpu process-input"><input type="number" min="1" step="1" value="1"> </td>
                      `;
    let table = document.querySelector(".main-table tbody");
    table.insertRow(table.rows.length).innerHTML = rowHTML1; // Insert CPU burst header row
    table.insertRow(table.rows.length).innerHTML = rowHTML2; // Insert input values row
    checkPriorityCell(); // Check if priority input should be shown/hidden for new process
    addremove();        // Attach add/remove event listeners for new row buttons
    updateColspan();    // Update colspan for new row cells
    inputOnChange();    // Attach input validation handlers for new inputs
}

// Removes the last process from the table if more than one exists
function deleteProcess() {
    let table = document.querySelector(".main-table");
    if (process > 1) {
        table.deleteRow(table.rows.length - 1); // Delete input values row
        table.deleteRow(table.rows.length - 1); // Delete CPU burst header row
        process--; // Decrement process count
    }
    updateColspan(); // Update colspan after removal
    inputOnChange(); // Revalidate inputs
}

// Attach add process button event listener
document.querySelector(".add-btn").onclick = () => {
    addProcess();
};
// Attach remove process button event listener
document.querySelector(".remove-btn").onclick = () => {
    deleteProcess();
};

// Class representing input parameters for CPU scheduling simulation
class Input {
    constructor() {
        this.processId = [];         // Array of process IDs
        this.priority = [];          // Priority for each process
        this.arrivalTime = [];       // Arrival time for each process
        this.processTime = [];       // Multidimensional array of CPU and IO burst times for each process
        this.processTimeLength = []; // Length of burst times array for each process
        this.totalBurstTime = [];    // Total CPU burst time sum for each process
        this.algorithm = "";         // Selected scheduling algorithm
        this.algorithmType = "";     // Type of algorithm: nonpreemptive, preemptive, roundrobin
        this.timeQuantum = 0;        // Time quantum for Round Robin
        this.contextSwitch = 0;      // Context switch time delay
    }
}

// Contains utility variables for CPU scheduling simulation state
class Utility {
    constructor() {
        this.remainingProcessTime = []; // Remaining burst times per process and segment
        this.remainingBurstTime = [];   // Remaining total burst times per process
        this.remainingTimeRunning = []; // Remaining time in current execution slice (for RR)
        this.currentProcessIndex = [];  // Current index into burst segments of each process
        this.start = [];                // Flags indicating if processes have started
        this.done = [];                 // Flags indicating if processes have finished
        this.returnTime = [];           // Time when I/O completes and process returns to ready queue
        this.currentTime = 0;           // Current simulation time
    }
}

// Class holding output data from simulation
class Output {
    constructor() {
        this.completionTime = [];   // Completion time of each process
        this.turnAroundTime = [];   // Turnaround time (CT - arrival)
        this.waitingTime = [];      // Waiting time (TAT - burst)
        this.responseTime = [];     // Response time for each process
        this.schedule = [];         // Sequence of processes executed with durations ([processId, time])
        this.timeLog = [];          // Detailed time logs of process states at each time unit
        this.contextSwitches = 0;   // Total number of context switches during execution
        this.averageTimes = [];     // Average times for CT, TAT, WT, RT
    }
}

// Class representing a time log entry during simulation
class TimeLog {
    constructor() {
        this.time = -1; // Time of log entry
        this.remain = [];   // Processes remaining and not arrived yet
        this.ready = [];    // Processes in ready queue
        this.running = [];  // Currently running process(es)
        this.block = [];    // Processes waiting in I/O
        this.terminate = []; // Processes that have terminated
        this.move = [];     // Transitions for this time unit (codes for transitions like remain->ready, ready->running, etc.)
    }
}

// Sets algorithm name and type fields in input based on selection
function setAlgorithmNameType(input, algorithm) {
    input.algorithm = algorithm;
    switch (algorithm) {
        case 'fcfs':
        case 'sjf':
        case 'ljf':
        case 'pnp':
        case 'hrrn':
            input.algorithmType = "nonpreemptive";
            break;
        case 'srtf':
        case 'lrtf':
        case 'pp':
            input.algorithmType = "preemptive";
            break;
        case 'rr':
            input.algorithmType = "roundrobin";
            break;
    }
}

// Updates input object with values from UI inputs for all processes
function setInput(input) {
    for (let i = 1; i <= process; i++) {
        input.processId.push(i - 1);
        let rowCells1 = document.querySelector(".main-table").rows[2 * i - 1].cells;
        let rowCells2 = document.querySelector(".main-table").rows[2 * i].cells;
        input.priority.push(Number(rowCells1[1].firstElementChild.value));  // Read priority input
        input.arrivalTime.push(Number(rowCells1[2].firstElementChild.value)); // Read arrival time input
        let ptn = Number(rowCells2.length);
        let pta = [];
        for (let j = 0; j < ptn; j++) {
            pta.push(Number(rowCells2[j].firstElementChild.value)); // Read burst time values (CPU or IO)
        }
        input.processTime.push(pta);
        input.processTimeLength.push(ptn); // Number of burst time segments for this process
    }
    // Calculate total CPU burst time for each process (sum even-indexed bursts since CPU bursts are in even indexes)
    input.totalBurstTime = new Array(process).fill(0);
    input.processTime.forEach((segments, i) => {
        segments.forEach((duration, j) => {
            if (j % 2 == 0) {
                input.totalBurstTime[i] += duration;
            }
        });
    });
    setAlgorithmNameType(input, selectedAlgorithm.value);
    input.contextSwitch = Number(document.querySelector("#context-switch").value);
    input.timeQuantum = Number(document.querySelector("#tq").value);
}

// Initializes utility object with copies of input data and default states
function setUtility(input, utility) {
    utility.remainingProcessTime = input.processTime.slice();
    utility.remainingBurstTime = input.totalBurstTime.slice();
    utility.remainingTimeRunning = new Array(process).fill(0);
    utility.currentProcessIndex = new Array(process).fill(0);
    utility.start = new Array(process).fill(false);
    utility.done = new Array(process).fill(false);
    utility.returnTime = input.arrivalTime.slice();
}

// Reduces schedule array by combining consecutive time slices of the same process
function reduceSchedule(schedule) {
    let newSchedule = [];
    let currentScheduleElement = schedule[0][0];
    let currentScheduleLength = schedule[0][1];
    for (let i = 1; i < schedule.length; i++) {
        if (schedule[i][0] == currentScheduleElement) {
            currentScheduleLength += schedule[i][1];
        } else {
            newSchedule.push([currentScheduleElement, currentScheduleLength]);
            currentScheduleElement = schedule[i][0];
            currentScheduleLength = schedule[i][1];
        }
    }
    newSchedule.push([currentScheduleElement, currentScheduleLength]);
    return newSchedule;
}

// Reduces time log to remove consecutive duplicate log entries for brevity
function reduceTimeLog(timeLog) {
    let timeLogLength = timeLog.length;
    let newTimeLog = [],
        j = 0;
    for (let i = 0; i < timeLogLength - 1; i++) {
        if (timeLog[i] != timeLog[i + 1]) {
            newTimeLog.push(timeLog[j]);
        }
        j = i + 1;
    }
    if (j == timeLogLength - 1) {
        newTimeLog.push(timeLog[j]);
    }
    return newTimeLog;
}

// Calculates and returns average completion, turnaround, waiting, and response times
function outputAverageTimes(output) {
    let avgct = 0;
    output.completionTime.forEach((element) => {
        avgct += element;
    });
    avgct /= process;
    let avgtat = 0;
    output.turnAroundTime.forEach((element) => {
        avgtat += element;
    });
    avgtat /= process;
    let avgwt = 0;
    output.waitingTime.forEach((element) => {
        avgwt += element;
    });
    avgwt /= process;
    let avgrt = 0;
    output.responseTime.forEach((element) => {
        avgrt += element;
    });
    avgrt /= process;
    return [avgct, avgtat, avgwt, avgrt];
}

// Sets output metrics such as turnaround time and waiting time from completion and arrival times
function setOutput(input, output) {
    // Calculate turnaround and waiting times per process
    for (let i = 0; i < process; i++) {
        output.turnAroundTime[i] = output.completionTime[i] - input.arrivalTime[i];
        output.waitingTime[i] = output.turnAroundTime[i] - input.totalBurstTime[i];
    }
    output.schedule = reduceSchedule(output.schedule); // Simplify schedule representation
    output.timeLog = reduceTimeLog(output.timeLog);    // Simplify time log entries
    output.averageTimes = outputAverageTimes(output);  // Calculate averages for display
}

// Converts seconds (integer) to Date object (used for Gantt chart timeline scale)
function getDate(sec) {
    return (new Date(0, 0, 0, 0, sec / 60, sec % 60));
}

// Draws the Gantt chart showing process execution and context switches over time
function showGanttChart(output, outputDiv) {
    let ganttChartHeading = document.createElement("h3");
    ganttChartHeading.innerHTML = "Gantt Chart";
    outputDiv.appendChild(ganttChartHeading);
    let ganttChartData = [];
    let startGantt = 0;
    output.schedule.forEach((element) => {
        if (element[0] == -2) { // Context switch represented as grey bar with "CS"
            ganttChartData.push([
                "Time",
                "CS",
                "grey",
                getDate(startGantt),
                getDate(startGantt + element[1])
            ]);
        } else if (element[0] == -1) { // Idle time represented as black bar labeled "Empty"
            ganttChartData.push([
                "Time",
                "Empty",
                "black",
                getDate(startGantt),
                getDate(startGantt + element[1])
            ]);
        } else { // Process running represented by process ID label
            ganttChartData.push([
                "Time",
                "P" + element[0],
                "",
                getDate(startGantt),
                getDate(startGantt + element[1])
            ]);
        }
        startGantt += element[1];
    });
    let ganttChart = document.createElement("div");
    ganttChart.id = "gantt-chart";

    google.charts.load("current", { packages: ["timeline"] });
    google.charts.setOnLoadCallback(drawGanttChart);

    function drawGanttChart() {
        var container = document.getElementById("gantt-chart");
        var chart = new google.visualization.Timeline(container);
        var dataTable = new google.visualization.DataTable();

        dataTable.addColumn({ type: "string", id: "Gantt Chart" });
        dataTable.addColumn({ type: "string", id: "Process" });
        dataTable.addColumn({ type: 'string', id: 'style', role: 'style' });
        dataTable.addColumn({ type: "date", id: "Start" });
        dataTable.addColumn({ type: "date", id: "End" });
        dataTable.addRows(ganttChartData);

        let ganttWidth = '100%';
        if (startGantt >= 20) {
            ganttWidth = 0.05 * startGantt * screen.availWidth;
        }
        var options = {
            width: ganttWidth,
            timeline: {
                showRowLabels: false,
                avoidOverlappingGridLines: false
            }
        };
        chart.draw(dataTable, options);
    }
    outputDiv.appendChild(ganttChart);
}

// Draws the timeline chart showing the run time intervals per process in chronological order
function showTimelineChart(output, outputDiv) {
    let timelineChartHeading = document.createElement("h3");
    timelineChartHeading.innerHTML = "Timeline Chart";
    outputDiv.appendChild(timelineChartHeading);
    let timelineChartData = [];
    let startTimeline = 0;
    output.schedule.forEach((element) => {
        if (element[0] >= 0) { // Only include actual process intervals (not context switch or idle)
            timelineChartData.push([
                "P" + element[0],
                getDate(startTimeline),
                getDate(startTimeline + element[1])
            ]);
        }
        startTimeline += element[1];
    });
    // Sort timeline data by process ID for showing all intervals together
    timelineChartData.sort((a, b) => parseInt(a[0].substring(1)) - parseInt(b[0].substring(1)));
    let timelineChart = document.createElement("div");
    timelineChart.id = "timeline-chart";

    google.charts.load("current", { packages: ["timeline"] });
    google.charts.setOnLoadCallback(drawTimelineChart);

    function drawTimelineChart() {
        var container = document.getElementById("timeline-chart");
        var chart = new google.visualization.Timeline(container);
        var dataTable = new google.visualization.DataTable();

        dataTable.addColumn({ type: "string", id: "Process" });
        dataTable.addColumn({ type: "date", id: "Start" });
        dataTable.addColumn({ type: "date", id: "End" });
        dataTable.addRows(timelineChartData);

        let timelineWidth = '100%';
        if (startTimeline >= 20) {
            timelineWidth = 0.05 * startTimeline * screen.availWidth;
        }
        var options = {
            width: timelineWidth,
        };
        chart.draw(dataTable, options);
    }
    outputDiv.appendChild(timelineChart);
}

// Displays summary table and calculation results: completion, turnaround, waiting and response times + CPU utilization and throughput
function showFinalTable(input, output, outputDiv) {
    let finalTableHeading = document.createElement("h3");
    finalTableHeading.innerHTML = "Final Table";
    outputDiv.appendChild(finalTableHeading);
    let table = document.createElement("table");
    table.classList.add("final-table");
    let thead = table.createTHead();
    let row = thead.insertRow(0);
    let headings = [
        "Process",
        "Arrival Time",
        "Total Burst Time",
        "Completion Time",
        "Turn Around Time",
        "Waiting Time",
        "Response Time",
    ];
    headings.forEach((element, index) => {
        let cell = row.insertCell(index);
        cell.innerHTML = element;
    });
    let tbody = table.createTBody();
    for (let i = 0; i < process; i++) {
        let row = tbody.insertRow(i);
        row.insertCell(0).innerHTML = "P" + (i + 1);
        row.insertCell(1).innerHTML = input.arrivalTime[i];
        row.insertCell(2).innerHTML = input.totalBurstTime[i];
        row.insertCell(3).innerHTML = output.completionTime[i];
        row.insertCell(4).innerHTML = output.turnAroundTime[i];
        row.insertCell(5).innerHTML = output.waitingTime[i];
        row.insertCell(6).innerHTML = output.responseTime[i];
    }
    outputDiv.appendChild(table);

    // Calculate CPU Utilization and Throughput statistics
    let tbt = 0;
    input.totalBurstTime.forEach((element) => (tbt += element));
    let lastct = 0;
    output.completionTime.forEach((element) => (lastct = Math.max(lastct, element)));

    let cpu = document.createElement("p");
    cpu.innerHTML = "CPU Utilization : " + ((tbt / lastct) * 100).toFixed(2) + "%";
    outputDiv.appendChild(cpu);

    let tp = document.createElement("p");
    tp.innerHTML = "Throughput : " + (process / lastct).toFixed(2);
    outputDiv.appendChild(tp);

    if (input.contextSwitch > 0) {
        let cs = document.createElement("p");
        cs.innerHTML = "Number of Context Switches : " + (output.contextSwitches - 1);
        outputDiv.appendChild(cs);
    }
}

// Changes color of arrows representing process state transitions in the time log view
function toggleTimeLogArrowColor(timeLog, color) {
    let timeLogMove = ['remain-ready', 'ready-running', 'running-terminate', 'running-ready', 'running-block', 'block-ready'];
    timeLog.move.forEach(element => {
        document.getElementById(timeLogMove[element]).style.color = color;
    });
}

// Displays one time log entry - with tables showing remain, ready, running, block and terminate process sets
function nextTimeLog(timeLog) {
    let timeLogTableDiv = document.getElementById("time-log-table-div");

    let arrowHTML = `
    <p id="remain-ready" class="arrow">&rarr;</p>
    <p id="ready-running" class="arrow">&#10554;</p>
    <p id="running-ready" class="arrow">&#10554;</p>
    <p id="running-terminate" class="arrow">&rarr;</p>
    <p id="running-block" class="arrow">&rarr;</p>
    <p id="block-ready" class="arrow">&rarr;</p>
    `;
    timeLogTableDiv.innerHTML = arrowHTML;

    // Create tables for different states and populate with process IDs
    const createStateTable = (id, title, list) => {
        let table = document.createElement("table");
        table.id = id;
        table.className = 'time-log-table';
        let thead = table.createTHead();
        let row = thead.insertRow(0);
        let heading = row.insertCell(0);
        heading.innerHTML = title;
        let tbody = table.createTBody();
        for (let i = 0; i < list.length; i++) {
            let row = tbody.insertRow(i);
            let cell = row.insertCell(0);
            cell.innerHTML = 'P' + (list[i] + 1);
        }
        timeLogTableDiv.appendChild(table);
    }

    createStateTable("remain-table", "Remain", timeLog.remain);
    createStateTable("ready-table", "Ready", timeLog.ready);
    createStateTable("running-table", "Running", timeLog.running);
    createStateTable("block-table", "Block", timeLog.block);
    createStateTable("terminate-table", "Terminate", timeLog.terminate);

    document.getElementById("time-log-time").innerHTML = "Time : " + timeLog.time;
}

// Allows user to start auto-play of the time log changes over time with visual animation
function showTimeLog(output, outputDiv) {
    reduceTimeLog(output.timeLog);
    let timeLogDiv = document.createElement("div");
    timeLogDiv.id = "time-log-div";
    timeLogDiv.style.height = (15 * process) + 300 + "px";

    let startTimeLogButton = document.createElement("button");
    startTimeLogButton.id = "start-time-log";
    startTimeLogButton.innerHTML = "Start Time Log";
    timeLogDiv.appendChild(startTimeLogButton);
    outputDiv.appendChild(timeLogDiv);

    document.querySelector("#start-time-log").onclick = () => {
        timeLogStart = 1;
        let timeLogDiv = document.getElementById("time-log-div");
        let timeLogOutputDiv = document.createElement("div");
        timeLogOutputDiv.id = "time-log-output-div";

        let timeLogTableDiv = document.createElement("div");
        timeLogTableDiv.id = "time-log-table-div";

        let timeLogTime = document.createElement("p");
        timeLogTime.id = "time-log-time";

        timeLogOutputDiv.appendChild(timeLogTableDiv);
        timeLogOutputDiv.appendChild(timeLogTime);
        timeLogDiv.appendChild(timeLogOutputDiv);
        let index = 0;
        let timeLogInterval = setInterval(() => {
            nextTimeLog(output.timeLog[index]); // Show next time log state
            if (index != output.timeLog.length - 1) {
                setTimeout(() => {
                    toggleTimeLogArrowColor(output.timeLog[index], 'red');
                    setTimeout(() => {
                        toggleTimeLogArrowColor(output.timeLog[index], 'black');
                    }, 600);
                }, 200);
            }
            index++;
            if (index == output.timeLog.length) {
                clearInterval(timeLogInterval); // Stop when last entry shown
            }
            // Allow re-calculation by stopping interval if "calculate" clicked
            document.getElementById("calculate").onclick = () => {
                clearInterval(timeLogInterval);
                document.getElementById("time-log-output-div").innerHTML = "";
                calculateOutput();
            }
        }, 1000);
    };
}

// Generates a chart comparing Round Robin average scheduling times and context switches for varying time quantum
function showRoundRobinChart(outputDiv) {
    let roundRobinInput = new Input();
    setInput(roundRobinInput);

    // Find max CPU burst time among all processes to limit time quantum range
    let maxTimeQuantum = 0;
    roundRobinInput.processTime.forEach(processTimeArray => {
        processTimeArray.forEach((time, index) => {
            if (index % 2 == 0) {
                maxTimeQuantum = Math.max(maxTimeQuantum, time);
            }
        });
    });

    let roundRobinChartData = [
        [],
        [],
        [],
        [],
        []
    ];
    let timeQuantumArray = [];

    // Run the Round Robin scheduler for each possible time quantum value and gather averages
    for (let timeQuantum = 1; timeQuantum <= maxTimeQuantum; timeQuantum++) {
        timeQuantumArray.push(timeQuantum);
        let roundRobinInput = new Input();
        setInput(roundRobinInput);
        setAlgorithmNameType(roundRobinInput, 'rr');
        roundRobinInput.timeQuantum = timeQuantum;

        let roundRobinUtility = new Utility();
        setUtility(roundRobinInput, roundRobinUtility);
        let roundRobinOutput = new Output();
        CPUScheduler(roundRobinInput, roundRobinUtility, roundRobinOutput);
        setOutput(roundRobinInput, roundRobinOutput);

        for (let i = 0; i < 4; i++) {
            roundRobinChartData[i].push(roundRobinOutput.averageTimes[i]);
        }
        roundRobinChartData[4].push(roundRobinOutput.contextSwitches);
    }

    // Create and display line chart for Round Robin statistics using Chart.js
    let roundRobinChartCanvas = document.createElement('canvas');
    roundRobinChartCanvas.id = "round-robin-chart";
    let roundRobinChartDiv = document.createElement('div');
    roundRobinChartDiv.id = "round-robin-chart-div";
    roundRobinChartDiv.appendChild(roundRobinChartCanvas);
    outputDiv.appendChild(roundRobinChartDiv);

    new Chart(document.getElementById('round-robin-chart'), {
        type: 'line',
        data: {
            labels: timeQuantumArray,
            datasets: [{
                    label: "Completion Time",
                    borderColor: '#3366CC',
                    data: roundRobinChartData[0]
                },
                {
                    label: "Turn Around Time",
                    borderColor: '#DC3912',
                    data: roundRobinChartData[1]
                },
                {
                    label: "Waiting Time",
                    borderColor: '#FF9900',
                    data: roundRobinChartData[2]
                },
                {
                    label: "Response Time",
                    borderColor: '#109618',
                    data: roundRobinChartData[3]
                },
                {
                    label: "Context Switches",
                    borderColor: '#990099',
                    data: roundRobinChartData[4]
                },
            ]
        },
        options: {
            title: {
                display: true,
                text: ['Round Robin', 'Comparison of Completion, Turn Around, Waiting, Response Time and Context Switches', 'The Lower The Better']
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Time Quantum'
                    }
                }]
            },
            legend: {
                display: true,
                labels: {
                    fontColor: 'black'
                }
            }
        }
    });
}

// Generates a comparison bar chart of average metrics for all supported algorithms
function showAlgorithmChart(outputDiv) {
    let algorithmArray = ["fcfs", "sjf", "srtf", "ljf", "lrtf", "rr", "hrrn", "pnp", "pp"];
    let algorithmNameArray = ["FCFS", "SJF", "SRTF", "LJF", "LRTF", "RR", "HRRN", "PNP", "PP"];
    let algorithmChartData = [
        [],
        [],
        [],
        []
    ];

    // Run simulations for each algorithm and collect average metrics
    algorithmArray.forEach(currentAlgorithm => {
        let chartInput = new Input();
        let chartUtility = new Utility();
        let chartOutput = new Output();
        setInput(chartInput);
        setAlgorithmNameType(chartInput, currentAlgorithm);
        setUtility(chartInput, chartUtility);
        CPUScheduler(chartInput, chartUtility, chartOutput);
        setOutput(chartInput, chartOutput);
        for (let i = 0; i < 4; i++) {
            algorithmChartData[i].push(chartOutput.averageTimes[i]);
        }
    });

    // Create and show bar chart comparing algorithm metrics using Chart.js
    let algorithmChartCanvas = document.createElement('canvas');
    algorithmChartCanvas.id = "algorithm-chart";
    let algorithmChartDiv = document.createElement('div');
    algorithmChartDiv.id = "algorithm-chart-div";
    algorithmChartDiv.style.height = "40vh";
    algorithmChartDiv.style.width = "80%";
    algorithmChartDiv.appendChild(algorithmChartCanvas);
    outputDiv.appendChild(algorithmChartDiv);

    new Chart(document.getElementById('algorithm-chart'), {
        type: 'bar',
        data: {
            labels: algorithmNameArray,
            datasets: [{
                    label: "Completion Time",
                    backgroundColor: '#3366CC',
                    data: algorithmChartData[0]
                },
                {
                    label: "Turn Around Time",
                    backgroundColor: '#DC3912',
                    data: algorithmChartData[1]
                },
                {
                    label: "Waiting Time",
                    backgroundColor: '#FF9900',
                    data: algorithmChartData[2]
                },
                {
                    label: "Response Time",
                    backgroundColor: '#109618',
                    data: algorithmChartData[3]
                }
            ]
        },
        options: {
            title: {
                display: true,
                text: ['Algorithm', 'Comparison of Completion, Turn Around, Waiting and Response Time', 'The Lower The Better']
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Algorithms'
                    }
                }]
            },
            legend: {
                display: true,
                labels: {
                    fontColor: 'black'
                }
            }
        }
    });
}

// Shows all output views including charts, tables and time logs for the completed scheduling simulation
function showOutput(input, output, outputDiv) {
    showGanttChart(output, outputDiv);
    outputDiv.insertAdjacentHTML("beforeend", "<hr>");
    showTimelineChart(output, outputDiv);
    outputDiv.insertAdjacentHTML("beforeend", "<hr>");
    showFinalTable(input, output, outputDiv);
    outputDiv.insertAdjacentHTML("beforeend", "<hr>");
    showTimeLog(output, outputDiv);
    outputDiv.insertAdjacentHTML("beforeend", "<hr>");
    if (selectedAlgorithm.value == "rr") {
        showRoundRobinChart(outputDiv);
        outputDiv.insertAdjacentHTML("beforeend", "<hr>");
    }
    showAlgorithmChart(outputDiv);
}

// Primary CPU scheduling simulation engine function
function CPUScheduler(input, utility, output) {
    // Updates the ready queue by moving processes that have arrived or completed I/O into ready
    function updateReadyQueue(currentTimeLog) {
        // Move processes that have arrived from remain to ready
        let candidatesRemain = currentTimeLog.remain.filter((element) => input.arrivalTime[element] <= currentTimeLog.time);
        if (candidatesRemain.length > 0) {
            currentTimeLog.move.push(0);
        }
        // Move processes whose I/O is done from block to ready
        let candidatesBlock = currentTimeLog.block.filter((element) => utility.returnTime[element] <= currentTimeLog.time);
        if (candidatesBlock.length > 0) {
            currentTimeLog.move.push(5);
        }
        let candidates = candidatesRemain.concat(candidatesBlock);
        candidates.sort((a, b) => utility.returnTime[a] - utility.returnTime[b]);
        candidates.forEach(element => {
            moveElement(element, currentTimeLog.remain, currentTimeLog.ready);
            moveElement(element, currentTimeLog.block, currentTimeLog.ready);
        });
        output.timeLog.push(JSON.parse(JSON.stringify(currentTimeLog)));
        currentTimeLog.move = [];
    }

    // Helper function to move a process from one list to another if conditions met
    function moveElement(value, from, to) {
        let index = from.indexOf(value);
        if (index != -1) {
            from.splice(index, 1);
        }
        if (to.indexOf(value) == -1) {
            to.push(value);
        }
    }

    let currentTimeLog = new TimeLog();
    currentTimeLog.remain = input.processId; // Initially, all processes are in remain queue
    output.timeLog.push(JSON.parse(JSON.stringify(currentTimeLog)));
    currentTimeLog.move = [];
    currentTimeLog.time++;

    let lastFound = -1; // Track last running process

    // Run simulation until all processes are done
    while (utility.done.some((element) => element == false)) {
        updateReadyQueue(currentTimeLog);
        let found = -1;

        // Determine process currently running or ready to run based on algorithm
        if (currentTimeLog.running.length == 1) {
            found = currentTimeLog.running[0];
        } else if (currentTimeLog.ready.length > 0) {
            if (input.algorithm == 'rr') {
                found = currentTimeLog.ready[0];
                // Limit running time slice according to time quantum for Round Robin
                utility.remainingTimeRunning[found] = Math.min(utility.remainingProcessTime[found][utility.currentProcessIndex[found]], input.timeQuantum);
            } else {
                let candidates = currentTimeLog.ready;
                // Sort candidates by ID as tiebreaker
                candidates.sort((a, b) => a - b);
                // Sort candidates based on selected algorithm rules
                candidates.sort((a, b) => {
                    switch (input.algorithm) {
                        case 'fcfs':
                            return utility.returnTime[a] - utility.returnTime[b];
                        case 'sjf':
                        case 'srtf':
                            return utility.remainingBurstTime[a] - utility.remainingBurstTime[b];
                        case 'ljf':
                        case 'lrtf':
                            return utility.remainingBurstTime[b] - utility.remainingBurstTime[a];
                        case 'pnp':
                        case 'pp':
                            return priorityPreference * (input.priority[a] - input.priority[b]);
                        case 'hrrn':
                            function responseRatio(id) {
                                let s = utility.remainingBurstTime[id];
                                let w = currentTimeLog.time - input.arrivalTime[id] - s;
                                return 1 + w / s;
                            }
                            return responseRatio(b) - responseRatio(a);
                    }
                });
                found = candidates[0];
                // Handle context switch delay for preemptive algorithms when process switches
                if (input.algorithmType == "preemptive" && found >= 0 && lastFound >= 0 && found != lastFound) {
                    output.schedule.push([-2, input.contextSwitch]); // Add context switch placeholder in schedule
                    for (let i = 0; i < input.contextSwitch; i++, currentTimeLog.time++) {
                        updateReadyQueue(currentTimeLog);
                    }
                    if (input.contextSwitch > 0) {
                        output.contextSwitches++;
                    }
                }
            }
            moveElement(found, currentTimeLog.ready, currentTimeLog.running);
            currentTimeLog.move.push(1);
            output.timeLog.push(JSON.parse(JSON.stringify(currentTimeLog)));
            currentTimeLog.move = [];
            if (utility.start[found] == false) { // Record response time at start of first run
                utility.start[found] = true;
                output.responseTime[found] = currentTimeLog.time - input.arrivalTime[found];
            }
        }
        currentTimeLog.time++; // Increment time after scheduling decisions

        if (found != -1) {
            output.schedule.push([found + 1, 1]); // Add process run slice to schedule
            utility.remainingProcessTime[found][utility.currentProcessIndex[found]]--;
            utility.remainingBurstTime[found]--;

            if (input.algorithm == 'rr') {
                // Handle Round Robin process slice countdown and transitions
                utility.remainingTimeRunning[found]--;
                if (utility.remainingTimeRunning[found] == 0) {
                    if (utility.remainingProcessTime[found][utility.currentProcessIndex[found]] == 0) {
                        utility.currentProcessIndex[found]++;
                        if (utility.currentProcessIndex[found] == input.processTimeLength[found]) {
                            // Process done execution
                            utility.done[found] = true;
                            output.completionTime[found] = currentTimeLog.time;
                            moveElement(found, currentTimeLog.running, currentTimeLog.terminate);
                            currentTimeLog.move.push(2);
                        } else {
                            // Transition to I/O burst
                            utility.returnTime[found] = currentTimeLog.time + input.processTime[found][utility.currentProcessIndex[found]];
                            utility.currentProcessIndex[found]++;
                            moveElement(found, currentTimeLog.running, currentTimeLog.block);
                            currentTimeLog.move.push(4);
                        }
                        output.timeLog.push(JSON.parse(JSON.stringify(currentTimeLog)));
                        currentTimeLog.move = [];
                        updateReadyQueue(currentTimeLog);
                    } else {
                        updateReadyQueue(currentTimeLog);
                        moveElement(found, currentTimeLog.running, currentTimeLog.ready);
                        currentTimeLog.move.push(3);
                        output.timeLog.push(JSON.parse(JSON.stringify(currentTimeLog)));
                        currentTimeLog.move = [];
                    }
                    output.schedule.push([-2, input.contextSwitch]); // Context switch delay
                    for (let i = 0; i < input.contextSwitch; i++, currentTimeLog.time++) {
                        updateReadyQueue(currentTimeLog);
                    }
                    if (input.contextSwitch > 0) {
                        output.contextSwitches++;
                    }
                }
            } else { // For preemptive and non-preemptive algorithms other than RR
                if (utility.remainingProcessTime[found][utility.currentProcessIndex[found]] == 0) {
                    utility.currentProcessIndex[found]++;
                    if (utility.currentProcessIndex[found] == input.processTimeLength[found]) {
                        utility.done[found] = true;
                        output.completionTime[found] = currentTimeLog.time;
                        moveElement(found, currentTimeLog.running, currentTimeLog.terminate);
                        currentTimeLog.move.push(2);
                    } else {
                        utility.returnTime[found] = currentTimeLog.time + input.processTime[found][utility.currentProcessIndex[found]];
                        utility.currentProcessIndex[found]++;
                        moveElement(found, currentTimeLog.running, currentTimeLog.block);
                        currentTimeLog.move.push(4);
                    }
                    output.timeLog.push(JSON.parse(JSON.stringify(currentTimeLog)));
                    currentTimeLog.move = [];
                    if (currentTimeLog.running.length == 0) { // Handle context switch delay if no running process
                        output.schedule.push([-2, input.contextSwitch]);
                        for (let i = 0; i < input.contextSwitch; i++, currentTimeLog.time++) {
                            updateReadyQueue(currentTimeLog);
                        }
                        if (input.contextSwitch > 0) {
                            output.contextSwitches++;
                        }
                    }
                    lastFound = -1;
                } else if (input.algorithmType == "preemptive") {
                    moveElement(found, currentTimeLog.running, currentTimeLog.ready);
                    currentTimeLog.move.push(3);
                    output.timeLog.push(JSON.parse(JSON.stringify(currentTimeLog)));
                    currentTimeLog.move = [];
                    lastFound = found;
                }
            }
        } else {
            output.schedule.push([-1, 1]); // No process running: idle time
            lastFound = -1;
        }
        output.timeLog.push(JSON.parse(JSON.stringify(currentTimeLog))); // Save final time log for this time unit
    }
    output.schedule.pop(); // Remove last incomplete schedule entry
}

// Calculates output when calculate button clicked: runs the scheduling simulation and shows output
function calculateOutput() {
    let outputDiv = document.getElementById("output");
    outputDiv.innerHTML = "";
    let mainInput = new Input();
    let mainUtility = new Utility();
    let mainOutput = new Output();
    setInput(mainInput);                 // Prepare input from user form
    setUtility(mainInput, mainUtility); // Initialize utility state
    CPUScheduler(mainInput, mainUtility, mainOutput); // Run CPU scheduling simulation
    setOutput(mainInput, mainOutput);   // Compute turnaround, waiting, response times
    showOutput(mainInput, mainOutput, outputDiv); // Display all results and charts
}



//downlode working
function downloadResultsAsCSV() {
    const outputDiv = document.getElementById('output');
    if (!outputDiv) {
        alert('Output area not found!');
        return;
    }

    // Try to find the final results table inside outputDiv
    const finalTable = outputDiv.querySelector('table.final-table');
    if (!finalTable) {
        alert('Final results table not found in output.');
        return;
    }

    let csvContent = '';
    const rows = finalTable.querySelectorAll('tr');

    rows.forEach((row, rowIndex) => {
        const cols = row.querySelectorAll('td, th');
        let rowData = [];
        cols.forEach(col => {
            // Escape inner text commas and quotes for CSV
            let text = col.innerText.trim().replace(/"/g, '""');
            if (text.includes(',') || text.includes('"') ) {
                text = `"${text}"`;
            }
            rowData.push(text);
        });
        csvContent += rowData.join(",") + "\n";
    });

    // Add CPU Utilization, Throughput, and Context Switches if they exist
    const stats = [];
    const children = outputDiv.children;
    for(let i = 0; i < children.length; i++) {
        const el = children[i];
        if(el.tagName === 'P') {
            stats.push(el.innerText.trim());
        }
    }
    
    if(stats.length > 0) {
        csvContent += "\nSummary Stats\n";
        stats.forEach(stat => {
            // CSV line with just one column for stats
            csvContent += `"${stat}"\n`;
        });
    }

    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const filename = 'scheduling_results.csv';

    a.href = url;
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Attach this function to a button with id 'download-results'
document.getElementById('download-results').addEventListener('click', downloadResultsAsCSV);



// Attach calculation function to calculate button click event
document.getElementById("calculate").onclick = () => {
    calculateOutput();
};

