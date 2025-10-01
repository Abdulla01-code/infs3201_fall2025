const fs = require('fs/promises')
const prompt = require('prompt-sync')()


// This function will read the courses.json file and return an array of JSON objects
// that represent the courses in the system.
async function loadCourseData() {
        let raw = await fs.readFile('courses.json')
        let data = await JSON.parse(raw)
        return data
    

}

// This function will save the courseList array of courses into the file courses.json.  
// It is recommended that when start, write the data to a different file in case of issues,
// once your function is working you can change the name of the file.
async function saveCourseData(courseList) {
    await fs.writeFile('courses.json', JSON.stringify(courseList))

}

// This function will display all of the courses currently in the system.
// The output will be:
// CODE, Name, Capacity
// INFS3201, Web Tech II, 34
// INFS1201, Programming, 120
//
// If there are no courses then you should see the message "No courses".
// 
// The function takes no parameters and returns nothing.
async function listAllCourses() {
        let courseList = await loadCourseData()
        console.log('Code, Name, Capacity')
        for (let c of courseList) {
            console.log(`${c.code}`)
            console.log(`${c.name}`)
            console.log(`${c.capacity}`)
        }
}

// This function will display a single course given the code (i.e. INFS3201).  The format of the output
// must be:
//    Code: INFS3201
//    Name: Web Technologies II
//    Capacity: 24
// If there is no course with the given code then print the message "Course not found".
//
// The parameter is the code of the course to be displayed.  The function does not return any
// value.
async function findCourseByCode(code) {
    let courseList = await loadCourseData()
    for (let c of courseList) {
        if (c.code === code) {
            console.log(`Code: ${c.code}`)
            console.log(`Name: ${c.name}`)
            console.log(`Capacity: ${c.capacity}`)
            return
        }
    }
    console.log('Course not found')



}


// This function will display all courses with a minimum of "cap" capacity.  For example if you put
// the parameter cap at 30, we would see courses with a capacity 30 or larger.  The output should be
// the same as the listAllCourses() function.
//
// The function does not return any value.
async function findCoursesWithMinCapacity(cap) {
    let courseList = await loadCourseData()
    console.log('Code, Name, Capacity')
    for (let c of courseList) {
        if (c.capacity >= cap) {
            console.log(`${c.code}`)
            console.log(`${c.name}`)
            console.log(`${c.capacity}`)
        }
    }
}

// This function will update the capacity of a single course.  If the course code does not exist, print a message
// indicating that no course was found.
//
// The function does not return any value.
async function updateCapacity(code, capacity) {
    let courseList = await loadCourseData()
    for (let c of courseList) {
        if (c.code === code) {
            c.capacity = capacity
        }
    }
    await saveCourseData(courseList)
}

async function application(){
    while (true) {
        console.log('Options:')
        console.log('1. List all courses')
        console.log('2. Find course by code')
        console.log('3. Find courses with min capacity')
        console.log('4. Update capacity')
        console.log('5. Quit')
        let selection = Number(prompt("Enter option: "))
        if (selection == 1) {
            await listAllCourses()
        }
        else if (selection == 2){
            let course = prompt("Course code? ")
            await findCourseByCode(course)
        }
        else if (selection == 3) {
            // find a course with a minimum capacity
            let capacity = Number(prompt("What capacity? "))
            await findCoursesWithMinCapacity(capacity)
        }
        else if (selection == 4) {
            // update capacity of a course
            let course = prompt("Course code? ")
            let capacity = Number(prompt("What is the new capacity? "))
            await updateCapacity(course, capacity)
        }
        else if (selection == 5) {
            break // leave the loop
        }
        else {
            console.log('******** ERROR!!! Pick a number between 1 and 5')
        }
    }


}

application()


