import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../SocketContext';
import './SelectMode.css'

interface Champion {
    name: string;
    specialAbility: string;
    // Add more properties as needed, e.g., image, stats, etc.
}

const SelectModePage = () => {
    const navigate = useNavigate();
    const { socket } = useSocket();
    const [ongoingGameId, setOngoingGameId] = useState(null);
    const [showChampionSelection, setShowChampionSelection] = useState(false);
    const [selectedChampion, setSelectedChampion] = useState<Champion | null>(null);

    const champions: Champion[] = [
        { name: 'Champion1', specialAbility: 'Ability1' },
        { name: 'Champion2', specialAbility: 'Ability2' },
        // Add more champions as needed
    ];

    useEffect(() => {
        if (!socket) {
            console.error('Socket is not available');
            return;
        }

        socket.emit('checkGameStatus');

        const handleGameStatusResponse = (data: any) => {
            if (data.inGame) {
                setOngoingGameId(data.gameId);
            }
        };

        socket.on('gameStatusResponse', handleGameStatusResponse);

        return () => {
            socket.off('gameStatusResponse', handleGameStatusResponse);
        };
    }, [socket]);

    const handleClassicModeClick = () => {
        navigate('/matchmaking', { state: { gameMode: 'classic' } });
    };

    const handlePowerPongModeClick = () => {
        setShowChampionSelection(!showChampionSelection);
    };

    const handleChampionSelect = (champion: Champion) => {
        setSelectedChampion(champion);
        setShowChampionSelection(false);
        navigate('/matchmaking', { state: { gameMode: 'powerpong', champion } });
    };

    const handleReconnectClick = () => {
        if (ongoingGameId) {
            navigate(`/game/${ongoingGameId}`);
        }
    };

    return (
        <div className="mode-selection">
            <button className="mode-button classic-mode" onClick={handleClassicModeClick}>CLASSIC</button>
            <button className="mode-button power-pong-mode" onClick={handlePowerPongModeClick}>POWER PONG</button>
            {showChampionSelection && (
                <div className="champion-selection">
                    {/* Render buttons for each champion */}
                    {champions.map((champion) => (
                        <button key={champion.name} onClick={() => handleChampionSelect(champion)}>
                            {champion.name}
                        </button>
                    ))}
                </div>
            )}
            {ongoingGameId && (
                <button className="mode-button reconnect-button" onClick={handleReconnectClick}>RECONNECT</button>
            )}
            {/* Other buttons or components */}
        </div>
    );

};

export default SelectModePage;
