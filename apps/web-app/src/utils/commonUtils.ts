export function getWeekStartDate() {
    var today = new Date()
    var day = today.getDay()
    var diff = today.getDate() - day
    return new Date(today.setDate(diff))
}

export function getWeekEndDate() {
    var today = new Date()
    var day = today.getDay()
    var diff = today.getDate() + (6 - day)
    return new Date(today.setDate(diff))
}

export function getWeekStartDateFor(date: Date) {
    var today = new Date(date)
    var day = today.getDay()
    var diff = today.getDate() - day
    return new Date(today.setDate(diff))
}
export function getPreviousWeekStartDate(date: Date) {
    var currentWeek = new Date(date)
    var day = currentWeek.getDay()
    var diff = currentWeek.getDate() - day - 7
    return new Date(currentWeek.setDate(diff))
}
export function getPreviousWeekEndDate(date: Date) {
    var currentWeek = new Date(date)
    var day = currentWeek.getDay()
    var diff = currentWeek.getDate() - day - 1
    return new Date(currentWeek.setDate(diff))
}
export function getNextWeekStartDate(date: Date) {
    var currentWeek = new Date(date)
    var day = currentWeek.getDay()
    var diff = currentWeek.getDate() - day + 7
    return new Date(currentWeek.setDate(diff))
}
export function getNextWeekEndDate(date: Date) {
    var currentWeek = new Date(date)
    var day = currentWeek.getDay()
    var diff = currentWeek.getDate() + (6 - day) + 7
    return new Date(currentWeek.setDate(diff))
}

export function getWeekEndDateFor(date: Date) {
    var today = new Date(date)
    var day = today.getDay()
    var diff = today.getDate() + (6 - day)
    return new Date(today.setDate(diff))
}
export function getSimpleDate(date: Date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var dateOfMonth = date.getDate()
    return `${year}-${month}-${dateOfMonth}`
}
