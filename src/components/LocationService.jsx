"use client"

import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
})

const LocationMarker = ({ position, setPosition }) => {
  const map = useMap()

  useEffect(() => {
    if (position) {
      map.flyTo(position, 13)
    }
  }, [position, map])

  useMapEvents({
    click(e) {
      setPosition(e.latlng)
    },
  })

  return position ? <Marker position={position} /> : null
}

const MapComponent = ({ position, setPosition, defaultCenter }) => {
  return (
    <MapContainer center={defaultCenter} zoom={13} style={{ height: "300px" }} className="rounded-lg">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker position={position} setPosition={setPosition} />
    </MapContainer>
  )
}

const LocationService = () => {
  const [startPosition, setStartPosition] = useState(null)
  const [endPosition, setEndPosition] = useState(null)
  const [serviceType, setServiceType] = useState("")
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [defaultCenter, setDefaultCenter] = useState([6.5244, 3.3792]) // Lagos coordinates

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const userLocation = { lat: latitude, lng: longitude }
          setDefaultCenter([latitude, longitude])
          setStartPosition(userLocation)
          setEndPosition(userLocation)
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    } else {
      console.log("Geolocation is not available")
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!startPosition || !endPosition || !serviceType) {
      alert("Please fill in all fields")
      return
    }

    setIsLoading(true)
    // Simulating API call
    setTimeout(() => {
      setResult({
        price: "$50",
        time: "30 minutes",
        paymentLink: "https://example.com/payment",
      })
      setIsLoading(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-[#3B3835] p-8 md:p-16 text-white overflow-x-hidden">
      <h1 className="text-4xl md:text-5xl lg:text-6xl text-center font-bold mb-8 leading-tight animate-fade-in-down">
        ResQ-X Service Request
      </h1>
      <div className="max-w-4xl mx-auto bg-[#332414] p-6 md:p-8 rounded-lg shadow-lg animate-fade-in-up">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Start Location</label>
              <MapComponent position={startPosition} setPosition={setStartPosition} defaultCenter={defaultCenter} />
              {startPosition && (
                <p className="text-sm text-[#CCC8C4]">
                  Lat: {startPosition.lat.toFixed(4)}, Lng: {startPosition.lng.toFixed(4)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">End Location</label>
              <MapComponent position={endPosition} setPosition={setEndPosition} defaultCenter={defaultCenter} />
              {endPosition && (
                <p className="text-sm text-[#CCC8C4]">
                  Lat: {endPosition.lat.toFixed(4)}, Lng: {endPosition.lng.toFixed(4)}
                </p>
              )}
            </div>
          </div>
          <div className="animate-fade-in">
            <label className="block text-sm font-medium mb-2">Service Type</label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F5] text-[#3B3835] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8500] transition-all duration-300 ease-in-out"
            >
              <option value="">Select a service</option>
              <option value="TOW_TRUCK">Tow Truck</option>
              <option value="FUEL_DELIVERY">Fuel Delivery</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-[#FF8500] text-white py-3 px-4 rounded-md hover:bg-[#FF8500]/90 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FF8500] focus:ring-offset-2 focus:ring-offset-[#332414] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Get Service Details"
            )}
          </button>
        </form>
        {result && (
          <div className="mt-8 p-6 bg-[#FAF8F5] text-[#3B3835] rounded-lg animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">Service Details</h2>
            <p className="mb-2">
              <strong>Price:</strong> {result.price}
            </p>
            <p className="mb-2">
              <strong>Estimated Time:</strong> {result.time}
            </p>
            <a
              href={result.paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 bg-[#FF8500] text-white py-2 px-4 rounded-md hover:bg-[#FF8500]/90 transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              Proceed to Payment
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default LocationService

