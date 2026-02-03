
    // Initialize display
    function initializeApp() {
      const habitsList = document.getElementById('habits');
      if (habitsList.children.length === 0 || habitsList.querySelector('#nohabitsmsg')) {
        habitsList.innerHTML = '<p id="nohabitsmsg">No habits added yet. Start by adding a new habit!</p>';
      }
      updateStats();
    }

    // Add new habit
    document.getElementById('habitform').addEventListener('submit', function(event) {
      event.preventDefault();

      const noHabitsMsg = document.getElementById('nohabitsmsg');
      if (noHabitsMsg && noHabitsMsg.style.display !== 'none') {
        noHabitsMsg.style.display = 'none';
      }

      const habitInput = document.getElementById('newhabit');
      const habitList = document.getElementById('habits');

      if (habitInput.value.trim() === '') return;

      const habititem = document.createElement('li');
      habititem.id = 'pending';
      
      const habitText = document.createElement('span');
      habitText.textContent = habitInput.value;
      habitText.style.flex = '1';
      
      const buttonContainer = document.createElement('div');
      buttonContainer.style.display = 'flex';
      buttonContainer.style.gap = '0.5rem';

      const completebtn = document.createElement('button');
      completebtn.textContent = '✓ Complete';
      completebtn.classList.add('completebtn');

      const delbtn = document.createElement('button');
      delbtn.textContent = '✕ Delete';
      delbtn.classList.add('delbtn');

      buttonContainer.appendChild(completebtn);
      buttonContainer.appendChild(delbtn);
      
      habititem.appendChild(habitText);
      habititem.appendChild(buttonContainer);

      habitList.appendChild(habititem);
      //save to indexedDB
      addHabitToDB(habitInput.value);

      habitInput.value = '';
      
      updateStats();
    });

    // Handle habit actions (complete/delete)
    document.getElementById('habits').addEventListener('click', function(e) {
      if (e.target.classList.contains('completebtn')) {
        const habit = e.target.closest('li');
        if (habit.id === 'pending') {
          habit.id = 'completed';
          habit.querySelector('span').style.textDecoration = 'line-through';
          e.target.textContent = '↺ Undo';
        } else {
          habit.id = 'pending';
          habit.querySelector('span').style.textDecoration = 'none';
          e.target.textContent = '✓ Complete';
        }
        updateStats();
      } else if (e.target.classList.contains('delbtn')) {
        const habit = e.target.closest('li');
        habit.remove();
        
        const habitsList = document.getElementById('habits');
        if (habitsList.children.length === 0) {
          habitsList.innerHTML = '<p id="nohabitsmsg">No habits added yet. Start by adding a new habit!</p>';
        }
        updateStats();
      }
    });

    // Theme toggle
    document.getElementById('toggle').addEventListener('click', function() {
      document.body.classList.toggle('dark');
      const btn = document.getElementById('toggle');
      if (document.body.classList.contains('dark')) {
        btn.textContent = '☀️ Toggle Theme';
      } else {
        btn.textContent = '🌙 Toggle Theme';
      }
    });

    // Hamburger menu toggle
    const hamburger = document.getElementById('hamburger');
    const navlinks = document.getElementById('navlinks');

    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('active');
      navlinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    navlinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', function() {
        hamburger.classList.remove('active');
        navlinks.classList.remove('active');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      const isClickInsideNav = navlinks.contains(event.target);
      const isClickOnHamburger = hamburger.contains(event.target);
      
      if (!isClickInsideNav && !isClickOnHamburger && navlinks.classList.contains('active')) {
        hamburger.classList.remove('active');
        navlinks.classList.remove('active');
      }
    });

    // Filter functionality
    document.getElementById('filter').addEventListener('change', function() {
      const filtervalue = document.getElementById('filter').value;
      const habits = document.querySelectorAll('#habits li');

      habits.forEach(habit => {
        if (filtervalue === 'all') {
          habit.style.display = 'flex';
        } else if (filtervalue === 'completed' && habit.id === 'completed') {
          habit.style.display = 'flex';
        } else if (filtervalue === 'pending' && habit.id === 'pending') {
          habit.style.display = 'flex';
        } else {
          habit.style.display = 'none';
        }
      });
    });

    // Update progress circle
    function updateProgressCircle(percentage) {
      const circle = document.getElementById('progresscircle');
      const degrees = percentage * 3.6;
      circle.style.background = `conic-gradient(#026d9e ${degrees}deg, #e0e0e0 ${degrees}deg)`;
      document.getElementById('progressvalue').textContent = `${percentage}%`;
    }

    // Update statistics
    function updateStats() {
      const allHabits = document.querySelectorAll('#habits li');
      const completedHabits = document.querySelectorAll('#habits li#completed');
      const total = allHabits.length;
      const completed = completedHabits.length;
      
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      updateProgressCircle(percentage);
      
      const statsDiv = document.getElementById('stats');
      statsDiv.innerHTML = `
        <p>✅ Total Habits Completed: <strong>${completed}</strong></p>
      `;
    }

    // Motivational quotes
    const quotes = [
      "The secret of getting ahead is getting started. Small daily improvements lead to stunning results.",
      "Success is the sum of small efforts repeated day in and day out.",
      "Your habits shape your identity, and your identity shapes your habits.",
      "Don't break the chain. Consistency is the key to building lasting habits.",
      "The only way to do great work is to love what you do.",
      "Believe you can and you're halfway there.",
      "A journey of a thousand miles begins with a single step.",
      "The future depends on what you do today.",
      "Excellence is not a destination; it is a continuous journey that never ends.",
      "Motivation is what gets you started. Habit is what keeps you going."
    ];

    document.getElementById('newquotebtn').addEventListener('click', function() {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      document.querySelector('#quotes p').textContent = `"${randomQuote}"`;
    });

    // Initialize app on load
    initializeApp();


    //indexedDB setup
    let db;
const request = indexedDB.open("HabitTrackerDB", 1);

request.onupgradeneeded = function(event) {
  db = event.target.result;
  const store = db.createObjectStore("habits", { keyPath: "id", autoIncrement: true });
  store.createIndex("status", "status", { unique: false });
};

request.onsuccess = function(event) {
  db = event.target.result;
  loadHabits(); // Load habits when DB is ready
};

request.onerror = function(event) {
  console.error("Database error:", event.target.errorCode);
};

function loadHabits() {
  const tx = db.transaction("habits", "readonly");
  const store = tx.objectStore("habits");
  const request = store.getAll();

  request.onsuccess = function() {
    const habits = request.result;
    const habitList = document.getElementById('habits');
    habitList.innerHTML = ''; // Clear existing list and load from DB

    if (habits.length === 0) {
      habitList.innerHTML = '<p id="nohabitsmsg">No habits added yet. Start by adding a new habit!</p>';
    } else {
      habits.forEach(habit => renderHabit(habit));
    }

    updateStats();
  };
}



function renderHabit(habit) {
  const habititem = document.createElement('li');
  habititem.id = habit.status;

  const habitText = document.createElement('span');
  habitText.textContent = habit.text;
  if (habit.status === 'completed') {
    habitText.style.textDecoration = 'line-through';
  }

  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.gap = '0.5rem';

  const completebtn = document.createElement('button');
  completebtn.textContent = habit.status === 'completed' ? '↺ Undo' : '✓ Complete';
  completebtn.classList.add('completebtn');
  completebtn.dataset.id = habit.id; // store DB id

  const delbtn = document.createElement('button');
  delbtn.textContent = '✕ Delete';
  delbtn.classList.add('delbtn');
  delbtn.dataset.id = habit.id;

  buttonContainer.appendChild(completebtn);
  buttonContainer.appendChild(delbtn);

  habititem.appendChild(habitText);
  habititem.appendChild(buttonContainer);

  document.getElementById('habits').appendChild(habititem);
}


//add a habit to indexedDB
function addHabitToDB(habitText) {
  const tx = db.transaction("habits", "readwrite");
  const store = tx.objectStore("habits");
  const habit = { text: habitText, status: "pending" };
  const request = store.add(habit);
  request.onsuccess = function() {
    loadHabits(); // Refresh the habit list
  };
}

//update habit status in indexedDB
function updateHabitStatusInDB(id, status) {
  const tx = db.transaction("habits", "readwrite");
  const store = tx.objectStore("habits");
  const request = store.get(id);
  request.onsuccess = function() {
    const habit = request.result;
    habit.status = status;
    store.put(habit);
  }
}
//delete habit from indexedDB
function deleteHabitFromDB(id) {
  const tx = db.transaction("habits", "readwrite");
  const store = tx.objectStore("habits");
  store.delete(id);
}

