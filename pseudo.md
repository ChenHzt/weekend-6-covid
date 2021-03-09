html
 -container
 -custom data attributes

 css

state : {
    worldData:[],
    continentsData:[] ---> {continent:"asia,data:[]}

}

 func initialApiRequest ---> get the corona api world data
 -- get appropiate data save it to an object
 -- save it to state as worldData
 func getContientns
 -- we will call country api 
  * map over each continent and save to state
  * get different continents and place them as buttons
  * map over worldData and get the appropiate covid data to the specific country in each continent
  - char func
  * when a user clicks on a specific continent put that data in chart js
  