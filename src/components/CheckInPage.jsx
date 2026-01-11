import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Section from './ui/Section';
import Chip from './ui/Chip';
import Button from './ui/Button';
import { BOT_API_URL } from '../utils/constants';

const CheckInPage = ({ user, onBack }) => {
    const [loading, setLoading] = useState(false);
    const [showAdvice, setShowAdvice] = useState(false);
    const [aiMessage, setAiMessage] = useState("");

    // Figma Logic States
    const [logData, setLogData] = useState({
        flow: null,
        mood: [],
        energy: null,
        symptoms: [],
        vaginalSymptoms: [],
        sexualActivity: null,
        notes: ""
    });

    const handleSelect = (category, value) => {
        setLogData(prev => ({ ...prev, [category]: value }));
    };

    const handleToggle = (category, value) => {
        setLogData(prev => {
            const current = prev[category] || [];
            if (current.includes(value)) {
                return { ...prev, [category]: current.filter(item => item !== value) };
            } else {
                return { ...prev, [category]: [...current, value] };
            }
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Backend API (POST) ကို လှမ်းပို့ခြင်း
            const res = await fetch(`${BOT_API_URL}/api/user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatId: user?.id,
                    date: new Date().toISOString(),
                    logData: logData
                })
            });
            const data = await res.json();

            if (data.success) {
                if (data.aiAdvice) {
                    setAiMessage(data.aiAdvice);
                    setShowAdvice(true);
                } else {
                    alert("Logged successfully!");
                    onBack();
                }
            } else {
                alert("Error: " + data.error);
            }
        } catch (error) {
            console.error(error);
            alert("Connection Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-24 bg-pink-50 min-h-screen">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-3">
                <Button
                    variant="ghost"
                    onClick={onBack}
                    className="p-2 rounded-full hover:bg-gray-100"
                >
                    <ArrowLeft size={24} className="text-gray-600" />
                </Button>
                <h1 className="text-xl font-bold text-pink-600">How are you today?</h1>
            </div>

            <div className="p-4 space-y-6">
                {/* 1. Flow Section */}
                <Section title="Flow">
                    {['spotting', 'light', 'normal', 'heavy'].map(opt => (
                        <Chip key={opt} label={opt} selected={logData.flow === opt} onClick={() => handleSelect('flow', opt)} />
                    ))}
                </Section>

                {/* 2. Mood Section */}
                <Section title="Mood">
                    {['calm', 'happy', 'anxious', 'sad', 'irritated', 'tired'].map(opt => (
                        <Chip key={opt} label={opt} selected={logData.mood.includes(opt)} onClick={() => handleToggle('mood', opt)} />
                    ))}
                </Section>

                {/* 3. Physical Symptoms */}
                <Section title="Physical Symptoms">
                    {['cramps', 'headache', 'acne', 'backache', 'bloating', 'tender breasts'].map(opt => (
                        <Chip key={opt} label={opt} selected={logData.symptoms.includes(opt)} onClick={() => handleToggle('symptoms', opt)} />
                    ))}
                </Section>

                 {/* 4. Energy */}
                 <Section title="Energy Level">
                    {['low', 'medium', 'high'].map(opt => (
                        <Chip key={opt} label={opt} selected={logData.energy === opt} onClick={() => handleSelect('energy', opt)} />
                    ))}
                </Section>

                <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-4 rounded-2xl font-bold text-lg"
                >
                    {loading ? "Saving..." : "Submit Check-in"}
                </Button>
            </div>

            {/* AI Advice Modal */}
            {showAdvice && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
                    <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">❤️</span>
                            <h3 className="text-xl font-bold text-gray-800">Big Sister Says:</h3>
                        </div>
                        <p className="text-gray-600 mb-6 text-lg leading-relaxed">{aiMessage}</p>
                        <Button
                            onClick={onBack}
                            variant="outline"
                            className="w-full py-3 rounded-xl font-bold"
                        >
                            Thanks, close
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckInPage;