import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker, InfoWindow, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

const Plan = () => {
    const [placesToVisit, setPlacesToVisit] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [directions, setDirections] = useState(null);
    const [origin, setOrigin] = useState(null);
    const [destination, setDestination] = useState(null);
    const [placeDescriptions, setPlaceDescriptions] = useState({});
    const location = useLocation();

    const mapContainerStyle = {
        width: '100%',
        height: '600px'
    };

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const from = searchParams.get('from');
        const to = searchParams.get('to');

        if (from && to) {
            setLoading(true);
            setOrigin(from);
            setDestination(to);

            getPlacesToVisit(from, to)
                .then(async (places) => {
                    setPlacesToVisit(places);
                    const descriptions = await getPlaceDescriptions(places);
                    setPlaceDescriptions(descriptions);
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error:', error);
                    setError(error.message);
                    setLoading(false);
                });
        }
    }, [location.search]);

    const getPlacesToVisit = async (from, to) => {
        const COHERE_API_KEY = 'UTGAVIyQXf8SoaQJM0eg53uJGV3XHSM8Dd9kkHbF';
        const prompt = `List the top 5 tourist spots to visit between ${from} and ${to}. No Description. Format the response as a numbered list.`;

        try {
            const response = await axios.post(
                'https://api.cohere.ai/v1/generate',
                {
                    model: 'command-xlarge-nightly',
                    prompt: prompt,
                    max_tokens: 300,
                    temperature: 0.7,
                    k: 0,
                    stop_sequences: [],
                    return_likelihoods: 'NONE'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${COHERE_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const generatedText = response.data.generations[0].text;
            const places = generatedText
                .split('\n')
                .map(line => line.replace(/^\d+\.\s*/, '').trim())
                .filter(place => place.length > 0)
                .slice(0, 5);

            const geocodedPlaces = await Promise.all(places.map(async (place) => {
                try {
                    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(place)}&key=AIzaSyCMqVESfZlRY6LUHGKV0GuuTXh1Ugk7Ua0`);
                    if (response.data.results && response.data.results[0]) {
                        const { lat, lng } = response.data.results[0].geometry.location;
                        return { name: place, lat, lng };
                    }
                    return { name: place, lat: null, lng: null };
                } catch (error) {
                    console.error('Error geocoding place:', error);
                    return { name: place, lat: null, lng: null };
                }
            }));

            return geocodedPlaces.filter(place => place.lat && place.lng);
        } catch (error) {
            console.error('Error fetching places to visit:', error);
            return [];
        }
    };

    const getPlaceDescriptions = async (places) => {
        const COHERE_API_KEY = 'UTGAVIyQXf8SoaQJM0eg53uJGV3XHSM8Dd9kkHbF';
        const descriptions = {};
        for (const place of places) {
            const prompt = `Provide a brief 1-2 sentence description of ${place.name} as a tourist destination.`;
            try {
                const response = await axios.post(
                    'https://api.cohere.ai/v1/generate',
                    {
                        model: 'command-xlarge-nightly',
                        prompt: prompt,
                        max_tokens: 100,
                        temperature: 0.7,
                        k: 0,
                        stop_sequences: [],
                        return_likelihoods: 'NONE'
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${COHERE_API_KEY}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                descriptions[place.name] = response.data.generations[0].text.trim();
            } catch (error) {
                console.error('Error fetching description for', place.name, ':', error);
                descriptions[place.name] = 'Description not available.';
            }
        }
        return descriptions;
    };

    const directionsCallback = (result, status) => {
        if (status === 'OK') {
            setDirections(result);
        } else {
            console.error('Directions request failed due to ' + status);
        }
    };

    if (loading) {
        return <div className="p-10 m-10">Loading AI-generated places to visit and calculating route...</div>;
    }

    return (
        <div className="p-10 m-10">
            <div className="bg-white bg-opacity-80 p-6 rounded-lg shadow-lg">
                {error && <p className="text-red-500 mb-4">Error: {error}</p>}

                <h2 className="text-xl font-bold mt-4 mb-2">Top 5 Places to Visit - AI Generated</h2>
                {placesToVisit && placesToVisit.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {placesToVisit.map((place, index) => (
                                <div key={index} className="bg-blue-100 p-4 rounded-lg shadow">
                                    <h3 className="font-bold">{place.name}</h3>
                                    <p className="mt-2 text-sm">{placeDescriptions[place.name] || 'Loading description...'}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <h2 className="text-xl font-bold mb-2">Map of Places to Visit</h2>
                            {placesToVisit.length > 0 && (
                                <LoadScript googleMapsApiKey="AIzaSyCMqVESfZlRY6LUHGKV0GuuTXh1Ugk7Ua0">
                                    <GoogleMap
                                        mapContainerStyle={mapContainerStyle}
                                        center={placesToVisit[0]}
                                        zoom={6}
                                    >
                                        {placesToVisit.map((place, index) => (
                                            <Marker
                                                key={index}
                                                position={place}
                                                onClick={() => setSelectedPlace(place)}
                                            />
                                        ))}
                                        {selectedPlace && (
                                            <InfoWindow
                                                position={selectedPlace}
                                                onCloseClick={() => setSelectedPlace(null)}
                                            >
                                                <div>
                                                    <h2>{selectedPlace.name}</h2>
                                                    <p>{placeDescriptions[selectedPlace.name]}</p>
                                                </div>
                                            </InfoWindow>
                                        )}
                                        {origin && destination && (
                                            <DirectionsService
                                                options={{
                                                    destination: destination,
                                                    origin: origin,
                                                    travelMode: 'DRIVING',
                                                    waypoints: placesToVisit.map(place => ({
                                                        location: { lat: place.lat, lng: place.lng },
                                                        stopover: true
                                                    })),
                                                    optimizeWaypoints: true
                                                }}
                                                callback={directionsCallback}
                                            />
                                        )}
                                        {directions && (
                                            <DirectionsRenderer
                                                options={{
                                                    directions: directions
                                                }}
                                            />
                                        )}
                                    </GoogleMap>
                                </LoadScript>
                            )}
                        </div>
                    </>
                ) : (
                    <p>No places to visit available.</p>
                )}
            </div>
        </div>
    );
};

export default Plan;