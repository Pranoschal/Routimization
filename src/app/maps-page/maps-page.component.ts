import { AfterViewInit, Component, OnInit, ElementRef,HostListener } from '@angular/core';
import {} from 'googlemaps';
// import polyline from '@mapbox/polyline';
import { ViewChild } from '@angular/core';
import { TourOptimizationService } from '../services/TourOptimizationService'; // Import the service
import { WeatherService } from '../services/weather.service';
import * as XLSX from 'xlsx';
import { WeatherData } from 'src/types/defined-interfaces';
import { openWeatherWMOToEmoji } from '@akaguny/open-meteo-wmo-to-emoji';


@Component({
  selector: 'app-maps-page',
  templateUrl: './maps-page.component.html',
  styleUrls: ['./maps-page.component.css']
})
export class MapsPageComponent implements AfterViewInit {

  currentMiniRoute: any = 'hospital';

  @ViewChild('fileInput', { static: false })
  fileInput!: ElementRef;

  @ViewChild('map', { static: false }) mapElement!: ElementRef;
  map!: google.maps.Map;

  routes : any = [
  ];
  totalKm = ''
  totalTime = ''
  allWeatherUpdates= []
  data: any;
  selectedIndex: number | null = null;
  globalWeatherData : WeatherData = {
    latitude: 0,
    longitude: 0,
    generationtime_ms: 0,
    utc_offset_seconds: 0,
    timezone: '',
    timezone_abbreviation: '',
    elevation: 0,
    current_units: {
      time: 'ISO8601',
      interval: 'seconds',
      temperature_2m: '°C',
      relative_humidity_2m: '%',
      apparent_temperature: '°C',
      is_day: '',
      precipitation: 'mm',
      rain: 'mm',
      showers: 'mm',
      snowfall: 'cm',
      weather_code: '',
      cloud_cover: '%',
      pressure_msl: 'hPa',
      surface_pressure: 'hPa',
      wind_speed_10m: 'km/h',
      wind_direction_10m: '°',
      wind_gusts_10m: 'km/h'
    },
    current: {
      time: '',
      interval: 0,
      temperature_2m: 0,
      relative_humidity_2m: 0,
      apparent_temperature: 0,
      is_day: 0,
      precipitation: 0,
      rain: 0,
      showers: 0,
      snowfall: 0,
      weather_code: 0,
      cloud_cover: 0,
      pressure_msl: 0,
      surface_pressure: 0,
      wind_speed_10m: 0,
      wind_direction_10m: 0,
      wind_gusts_10m: 0
    },
    emoji:openWeatherWMOToEmoji(0)
  }

  initialWeatherData:any = {}


  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;
    if (!targetElement.closest('#stop')) {
      this.selectedIndex = null; 
      this.globalWeatherData = this.initialWeatherData
    }
  }


  preventDoubleClick(event: MouseEvent) {
    event.stopPropagation();
  }

  triggerFileUpload() {
    this.fileInput.nativeElement.click();
  }

  onTravelItemClick(item: any, index: number): void {
    this.selectedIndex = index;
    this.globalWeatherData = this.allWeatherUpdates[this.selectedIndex]
    this.globalWeatherData.emoji = openWeatherWMOToEmoji(this.globalWeatherData.current.weather_code);
  }


  onFileChange(event: any) {
    const target: DataTransfer = <DataTransfer>(event.target);

    if (target.files.length !== 1) throw new Error('Cannot use multiple files');

    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const mapProperties = {
        center: new google.maps.LatLng(12.971599, 77.594563),
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      };
  
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapProperties);

      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      this.data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      console.log(this.data); 

      let requestData :any = {
        "deliveries": [],
        "vehicleStartLocation":  {"latitude": -0.2846969, "longitude": 36.0673896},
        "globalStartTime": "2024-09-01T22:26:26.000Z",
        "globalEndTime": "2024-09-02T06:57:35.000Z"
      }
  
      let allDeliveries= []
  
      for(let i = 1; i<this.data.length; i++) {
        let delivery = { "longitude": this.data[i][5], "latitude":  this.data[i][6], "name" : `${this.data[i][2]},${this.data[i][1]},${this.data[i][5]},${this.data[i][6]}` };
        allDeliveries.push(delivery)
      }
      requestData.deliveries = allDeliveries;
  
      this.getOptimizedRoutes(requestData);

      console.log(requestData)
    };

    reader.readAsBinaryString(target.files[0]);

  


  }
  // Inject the TourOptimizationService
  constructor(private tourOptimizationService: TourOptimizationService, private weatherService: WeatherService) {}

  ngAfterViewInit(): void {
    const mapProperties = {
      center: new google.maps.LatLng(12.971599, 77.594563),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapProperties);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        this.map.setCenter(new google.maps.LatLng(userLocation.lat, userLocation.lng));
        this.weatherService.fetchWeatherData(userLocation.lat,userLocation.lng).subscribe((response:WeatherData) => {
          this.globalWeatherData = response;
          this.globalWeatherData.emoji = openWeatherWMOToEmoji(this.globalWeatherData.current.weather_code);
          this.initialWeatherData = this.globalWeatherData
        },
        (error) => {
          console.error('Error fetching weather data',error)
        }
        )
      }, (error) => {
        console.error('Error getting location:', error);
      });
    }

    const route_info = {
      "deliveries": [
        { "longitude": 153.0209968, "latitude": -30.4956498 , "name" : "Cap,MIRAH HOLDINGS PTY LTD,153.0209968,-30.4956497999999" },
        { "longitude": 152.896578, "latitude": -30.451955  , "name" : "Cap,BELLINGEN RETAIL PTY LTD,152.896578,-30.451955"},
        { "longitude": 152.995875, "latitude":  -30.746147 , "name" : "Cap,NIKKI LAIRD,152.995875,-30.746147" },
        { "longitude": 152.993676, "latitude": -30.820961  , "name" : "Cap,BEANS HOLDINGS PTY LTD,152.993675999999,-30.820961"},
        { "longitude": 152.84, "latitude": -31.0799999999999 , "name" : "Cap,KEMPSEY CENTRAL RETAILING UNIT TRUS,152.84,-31.0799999999999" },
        { "longitude": 152.830563, "latitude": -31.079792  , "name" : "Cap,TCG RETAIL PTY LTD,152.830563,-31.079792"},
        { "longitude": 153.1318872, "latitude":  -30.2832188 , "name" : "Cap,LUKE RAYMENT,153.131887199999,-30.2832188" }
      ],
      "vehicleStartLocation":  {"latitude": -0.2846969, "longitude": 36.0673896},
      "globalStartTime": "2024-09-01T22:26:26.000Z",
      "globalEndTime": "2024-09-02T06:57:35.000Z"
    }

  
    
    // Fetch optimized routes from the backend
  }

  getOptimizedRoutes(route_info:any) {

    const deliveries = route_info.deliveries.map((location: { latitude: any; longitude: any; name: any; }) => ({
      latitude: location.latitude,
      longitude: location.longitude,
      name : location.name
    }));
    
    const vehicleStartLocation = {
      latitude: route_info.vehicleStartLocation.latitude,
      longitude: route_info.vehicleStartLocation.longitude
    };
    
    // Convert ISO 8601 date strings to time strings (e.g., '08:00' format)
    const globalStartTime = "2024-09-01T22:26:26.000Z"
    const globalEndTime = "2024-09-02T06:57:35.000Z"
  

    // Call the service to optimize routes
    this.tourOptimizationService
      .optimizeTours(deliveries, vehicleStartLocation, globalStartTime, globalEndTime)
      .subscribe(
        (response : any) => {

          console.log('MYRESPONSE',response)
          this.routes = response.locationNames
          this.totalKm = response.totalTravelKM
          this.totalTime = response.totalTravelTime
          this.allWeatherUpdates = response.weatherUpdates
          //  console.log(transformCoordinatesToRoutes(response))
          this.plotOptimizedRoutes(response.decodedDataToSend); // Assuming the backend returns optimized routes
        },
        (error : any) => {
          console.error('Error optimizing routes:', error);
        }
      );
  }

  plotOptimizedRoutes(optimizedRoutes: any[]) {
    // Use Google Maps Directions Service to calculate the route
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      map: this.map,
    });

    const waypoints = optimizedRoutes.slice(1, -1).map((location) => ({
      location: new google.maps.LatLng(location.lat, location.lng),
      stopover: true,
    }));

    const request = {
      origin: new google.maps.LatLng(optimizedRoutes[0].lat, optimizedRoutes[0].lng),
      destination: new google.maps.LatLng(
        optimizedRoutes[optimizedRoutes.length - 1].lat,
        optimizedRoutes[optimizedRoutes.length - 1].lng
      ),
      waypoints: waypoints,
      travelMode: google.maps.TravelMode.DRIVING,
    };

    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(result);
      } else {
        console.error('Directions request failed due to ' + status);
      }
    });
  }

  changeRoute(route: string) {
    if (route === 'petrol') {
      this.currentMiniRoute = 'petrol';
    } else if (route === 'home') {
      this.currentMiniRoute = 'home';
    } else if (route === 'hospital') {
      this.currentMiniRoute = 'hospital';
    } else if (route === 'hotel') {
      this.currentMiniRoute = 'hotel';
    }
  }

 
}
 