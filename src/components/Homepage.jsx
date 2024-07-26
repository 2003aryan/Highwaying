import React, { useState, useEffect } from 'react';
import axios from 'axios';
import roadImage from '../assets/road.jpg';
import { useNavigate } from 'react-router-dom';

const Homepage = () => {
    const navigate = useNavigate();
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [cities, setCities] = useState([]);
    const [suggestions, setSuggestions] = useState([]);

    const backgroundImageStyle = {
        backgroundImage: `url(${roadImage})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        height: 'calc(100vh - 64px)',
    };

    useEffect(() => {
        fetchCities();
    }, []);

    const fetchCities = async () => {
        try {
            const response = await axios.get('https://api.api-ninjas.com/v1/city?country=IN&limit=10', {
                headers: { 'X-Api-Key': 'vhwcWv/Bd9/m0a7YqQi0zQ==nw8kg76sKn0fsZCd' },
            });
            setCities(response.data.map(city => city.name));
        } catch (error) {
            console.error('Error fetching cities:', error);
        }
    };

    const handleInputChange = async (e, setter) => {
        const value = e.target.value;
        setter(value);

        if (value.length > 1) {
            try {
                const response = await axios.get(`https://api.api-ninjas.com/v1/city?country=IN&name=${value}&limit=5`, {
                    headers: { 'X-Api-Key': 'vhwcWv/Bd9/m0a7YqQi0zQ==nw8kg76sKn0fsZCd' },
                });
                setSuggestions(response.data.map(city => city.name));
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            }
        } else {
            setSuggestions([]);
        }
    };

    const handleSearch = () => {
        navigate(`/plan?from=${from}&to=${to}`);
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center" style={backgroundImageStyle}>
            <div className="absolute inset-0 bg-black opacity-70"></div>
            <div className="relative max-w-xl mx-auto p-10 bg-white rounded-lg shadow-lg w-screen">
                <h1 className="text-2xl font-semibold mb-8 text-center text-gray-900">Plan My Trip</h1>
                <div className="flex mb-6">
                    <div className="w-1/2 pr-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">From:</label>
                        <input
                            list="fromCities"
                            value={from}
                            onChange={(e) => handleInputChange(e, setFrom)}
                            className="w-full px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:border-blue-500"
                            placeholder="Enter city name"
                        />
                        <datalist id="fromCities">
                            {suggestions.map((city, index) => (
                                <option key={index} value={city} />
                            ))}
                        </datalist>
                    </div>
                    <div className="w-1/2 pl-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">To:</label>
                        <input
                            list="toCities"
                            value={to}
                            onChange={(e) => handleInputChange(e, setTo)}
                            className="w-full px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:border-blue-500"
                            placeholder="Enter city name"
                        />
                        <datalist id="toCities">
                            {suggestions.map((city, index) => (
                                <option key={index} value={city} />
                            ))}
                        </datalist>
                    </div>
                </div>
                <button onClick={handleSearch} className="w-full bg-teal-500 hover:bg-teal-700 text-white font-bold p-2 rounded focus:outline-none focus:shadow-outline">
                    Search
                </button>
            </div>
        </div>
    );
}

export default Homepage;