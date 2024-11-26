import React from 'react';


const PlaylistList = ({ playlists }) => {
    return (
        <div>
            <h2>Playlists</h2>
            <div>
                {playlists.map((playlist) => (
                    <div key={playlist._id}>
                        <h3>{playlist.title}</h3>
                        <p>{playlist.description}</p>
                        <img
                            src={playlist.imageUrl}
                            alt={playlist.title}
                            style={{ width: '200px', height: '200px' }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlaylistList;
