const state = {
    worldData: new Map(),
    continentsData: {},
    currentMode: 'confirmed',
    currentContinent: 'world',
    myChart: null
}

class APIHandler {
    constructor() {
        this.proxy = `https://api.codetabs.com/v1/proxy/?quest=`;
        this.isLoading = false;
    }

    async getDataFromApi(api) {
        this.startLoading()
        const response = await fetch(`${this.proxy}${api}`);
        if (response.status !== 200) {
            throw 400;
        }
        const data = await response.json();
        this.endLoading();
        return data;
    }

    startLoading() {
        this.isLoading = true;
        //TODO:show spinner
    }

    endLoading() {
        this.isLoading = false;
        //TODO:hide spinner
    }
}

const apiHandler = new APIHandler();

const getCovidData = async () => {
    let worldData = await apiHandler.getDataFromApi(`https://corona-api.com/countries`);
    worldData = worldData.data;
    worldData.forEach((countryData) => {
        const countryObj = {
            code: countryData.code,
            name: countryData.name,
            data: {
                confirmed: countryData.latest_data.confirmed,
                critical: countryData.latest_data.critical,
                deaths: countryData.latest_data.deaths,
                recovered: countryData.latest_data.recovered,
                newCases: countryData.today.confirmed,
                newDeaths: countryData.today.deaths,
            }
        }
        state.worldData.set(countryData.code, countryObj);
    });
}

const getCurrentContinentCountriesData = async () => {
    let res;
    if(state.continentsData[state.currentContinent])
        return;

    let api = `restcountries.herokuapp.com/api/v1/region/${state.currentContinent}`;
    if (state.currentContinent === 'world')
        api = `restcountries.herokuapp.com/api/v1`;
    res = await apiHandler.getDataFromApi(api);
    state.continentsData[state.currentContinent] = [];
    res.forEach((countryInfo) => {
        state.worldData.get(countryInfo.cca2) && state.continentsData[state.currentContinent].push(state.worldData.get(countryInfo.cca2));
    });
    console.log(state.continentsData);
}

const renderGraph = () => {
    if (state.myChart != null) {
        state.myChart.destroy();
    }

    const ctx = document.getElementById('myChart').getContext('2d');
    let xLabel = state.continentsData[state.currentContinent].map((country) => country.name);
    let yLabel = state.continentsData[state.currentContinent].map((country) => country.data[state.currentMode]);;
    state.myChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: xLabel,
            datasets: [{
                label: `${state.currentContinent} - ${state.currentMode}`,
                data: yLabel,

                borderWidth: 1,
            },
            ],
        },
        options: {
            scales: {
                yAxes: [
                    {
                        ticks: {
                            beginAtZero: true,
                        },
                    },
                ],
            },
        },
    });
}

const addListOfCountries = () =>{
    const countriesListDisplay = document.querySelector('.countries-list');
    countriesListDisplay.innerHTML = '';
    const countries = state.continentsData[state.currentContinent].map((country) => {
        return {code: country.code, name: country.name};
    });
    countries.forEach((country) => {
        const li = document.createElement('li');
        li.setAttribute('data-country-code',country.code);
        li.innerHTML = country.name;
        countriesListDisplay.appendChild(li);
    })
}

const continentButtonEventListener = async (button) => {
    document.querySelector('.chart-container').style.display = 'block';
    document.querySelector('.country-stats-container').style.display = 'none';
    state.currentContinent = button.getAttribute('data-continent');
    await getCurrentContinentCountriesData();
    addListOfCountries();
    renderGraph();
}

const statModeButtonEventListener = async (button) =>{
    document.querySelector('.chart-container').style.display = 'block';
    document.querySelector('.country-stats-container').style.display = 'none';
    state.currentMode = button.getAttribute('data-stat-mode');
    renderGraph();
}

const countryButtonEventListener = (country) => {
    document.querySelector('.chart-container').style.display = 'none';
    document.querySelector('.country-stats-container').style.display = 'block';

    const countryStats = state.continentsData[state.currentContinent].find((c) => c.code === country.getAttribute('data-country-code'));

    document.querySelector('.country-stats-header').innerHTML = countryStats.name;
    const spans = Array.from(document.querySelectorAll('span[data-country-stats]'));
    
    spans.forEach((span) => {
        span.innerHTML = countryStats.data[span.getAttribute('data-country-stats')]
    })

}

const initializing = async () => {
    getCovidData();
    const continentsButtonsContainer = document.querySelector('.buttons-continents');
    continentsButtonsContainer.addEventListener('click', (event) => {
        const buttonContinent = event.target;
        if (buttonContinent.tagName === 'BUTTON') {
            continentButtonEventListener(buttonContinent);
        }
    });
    const statModesButtonsContainer = document.querySelector('.buttons-stats-modes');
    statModesButtonsContainer.addEventListener('click', (event) => {
        const buttonStatMode = event.target;
        if (buttonStatMode.tagName === 'BUTTON') {
            statModeButtonEventListener(buttonStatMode);
        }
    });

    const CountriesListDisplay = document.querySelector('.countries-list');
    CountriesListDisplay.addEventListener('click', (event) => {
        const country = event.target;
        if (country.tagName === 'LI') {
            countryButtonEventListener(country);
        }
    });

    
}

initializing();