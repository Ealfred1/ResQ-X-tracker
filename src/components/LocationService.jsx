"use client"

import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import axios from "axios"

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
  const [startAddress, setStartAddress] = useState("")
  const [endAddress, setEndAddress] = useState("")
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [isSUV, setIsSUV] = useState(false)

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

  const handleAddressSearch = async (address, setPosition) => {
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=AIzaSyALGmIoYG48UGPOdzglzaq_gL0epSLnlgc`)
      const { results } = response.data
      if (results.length > 0) {
        const { lat, lng } = results[0].geometry.location
        setPosition({ lat, lng })
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!startPosition || !endPosition || !serviceType || !userName || !userEmail) {
      alert("Please fill in all fields")
      return
    }

    setIsLoading(true)

    const payload = {
      dropoff_longitude: endPosition.lng.toString(),
      dropoff_latitude: endPosition.lat.toString(),
      pickup_latitude: startPosition.lat.toString(),
      pickup_longitude: startPosition.lng.toString(),
      is_SUV: isSUV,
      user_name: userName,
      user_email: userEmail,
    }

    try {
      const response = await axios.post(
        "https://internal-backend-rdhj.onrender.com/admin/offlineOrderDetails",
        payload,
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiOWZjYjIwNzItMzJiNS00ZjgzLTllNjMtMTMwMTExYzVlMWQyIiwibmFtZSI6IkVyaWMgQWxmcmVkIiwiY291bnRyeSI6Ik5pZ2VyaWEiLCJwaG9uZSI6IjA3MDEwMzYzNDI0IiwiZW1haWwiOiJhbGZyZWRlcmljMzcxQGdtYWlsLmNvbSIsInBhc3N3b3JkIjoiJDJhJDEwJEdrYjJhNlNNYlhvaExLN2k0T2plenVuaS9RLmQ4YlAwYW9vMVZYWHhXYXpydnB5QmQyRWZxIiwidHJhbnNhY3Rpb25fcGluIjpudWxsLCJwcm9maWxlX3BpY3R1cmUiOm51bGwsImlzX3ZlcmlmaWVkIjp0cnVlLCJpc19vbmxpbmUiOmZhbHNlLCJmY21Ub2tlbiI6bnVsbCwibG9uZ2l0dWRlIjpudWxsLCJsYXRpdHVkZSI6bnVsbCwicmVmcmVzaFRva2VuIjoiJDJhJDEwJHJOaDZmVUdFdzBaRVRJbkRwOGNVQS5HMEM3dFZ6dFNaT1FLRWRZajNvMnM3TEtweERNNUpTIiwidXNlclR5cGUiOiJBRE1JTiIsImNyZWF0ZWRfYXQiOiIyMDI1LTAyLTA0VDEyOjEyOjEyLjE0MVoiLCJ1cGRhdGVkX2F0IjoiMjAyNS0wMi0wNlQxOToyODo1Ny40ODlaIiwidXNlcl9hY2NvdW50IjpudWxsLCJ2ZWhpY2xlX2RldGFpbHMiOltdfSwic3ViIjoiOWZjYjIwNzItMzJiNS00ZjgzLTllNjMtMTMwMTExYzVlMWQyIiwiaWF0IjoxNzM4OTI1ODkyLCJleHAiOjE3MzkwMTIyOTJ9.5KeYQLbUDNGUAQj4ajxiD7M7PfMzAKvWuO2BzIDIM2E`,
            "x-resqx-key": "OGCALMDOWNLETMETHROUGH",
          },
        },
      )

      setResult(response.data.data)
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fff] p-8 md:p-16 text-white overflow-x-hidden">
      <h1 className="text-4xl md:text-5xl text-black lg:text-6xl text-center font-bold mb-8 leading-tight animate-fade-in-down">
        ResQ-X Service Request
      </h1>
      <div className="max-w-4xl mx-auto bg-[#332414] p-6 md:p-8 rounded-lg shadow-lg animate-fade-in-up">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Start Location</label>
              <input
                type="text"
                value={startAddress}
                onChange={(e) => setStartAddress(e.target.value)}
                onBlur={() => handleAddressSearch(startAddress, setStartPosition)}
                placeholder="Enter start address"
                className="w-full px-3 py-2 bg-[#FAF8F5] text-[#3B3835] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8500] transition-all duration-300 ease-in-out"
              />
              <MapComponent position={startPosition} setPosition={setStartPosition} defaultCenter={defaultCenter} />
              {startPosition && (
                <p className="text-sm text-[#CCC8C4]">
                  Lat: {startPosition.lat.toFixed(4)}, Lng: {startPosition.lng.toFixed(4)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">End Location</label>
              <input
                type="text"
                value={endAddress}
                onChange={(e) => setEndAddress(e.target.value)}
                onBlur={() => handleAddressSearch(endAddress, setEndPosition)}
                placeholder="Enter end address"
                className="w-full px-3 py-2 bg-[#FAF8F5] text-[#3B3835] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8500] transition-all duration-300 ease-in-out"
              />
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
          <div className="animate-fade-in">
            <label className="block text-sm font-medium mb-2">User Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-2 bg-[#FAF8F5] text-[#3B3835] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8500] transition-all duration-300 ease-in-out"
            />
          </div>
          <div className="animate-fade-in">
            <label className="block text-sm font-medium mb-2">User Email</label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3 py-2 bg-[#FAF8F5] text-[#3B3835] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8500] transition-all duration-300 ease-in-out"
            />
          </div>
          <div className="animate-fade-in">
            <label className="block text-sm font-medium mb-2">Is SUV?</label>
            <input
              type="checkbox"
              checked={isSUV}
              onChange={(e) => setIsSUV(e.target.checked)}
              className="mr-2"
            />
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
              <strong>Distance:</strong> {result.distance} km
            </p>
            <p className="mb-2">
              <strong>Estimated Time:</strong> {result.durationInMinutes} minutes
            </p>
            <p className="mb-2">
              <strong>Total Price:</strong> ₦{result.total_price}
            </p>
            <a
              href={result.paymentDetails.data.authorization_url}
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