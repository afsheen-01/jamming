
let userAccessToken = ''; 
const client_id = 'ed091a01669f4561b1beaf273b28d665';
const redirect_uri = 'http://firstproject-jamming.surge.sh';
const Spotify = {
    getAccessToken() {
        if(userAccessToken) {
           return userAccessToken;
        }
        const accessToken = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);
        if(accessToken && expiresInMatch){
            userAccessToken = accessToken[1];
            const expiresIn = Number(expiresInMatch[1]);

            window.setTimeout(() => userAccessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return userAccessToken;
        } else{
             const accessUrl = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirect_uri}`;
             window.location = accessUrl;
        }
        
    },

    search(term) {
        const accessToken = Spotify.getAccessToken();
        return fetch(`https://api.spotify.com/v1/search?q=${term}&type=track`, {
              headers: {Authorization: `Bearer ${accessToken}`}
             }).then(response => {
                return response.json();
             }).then(jsonResponse => {
                if(!jsonResponse.tracks){
                    return [];
                } else{
                    return jsonResponse.tracks.items.map(track => {
                        return {
                            id: track.id,
                            name: track.name,
                            artist: track.artists[0].name,
                            album: track.album.name,
                            uri: track.uri
                        }

                    });
                }
             })
    },

    savePlaylist(playlist, trackUris) {
        if(!playlist || !trackUris.length) {
            return;
        }
        const accessToken = Spotify.getAccessToken();
        const headers = {Authorization: `Bearer ${accessToken}` };
        let userId = '';
        return fetch('https://api.spotify.com/v1/me',{ headers: headers })
        .then(response => {
            return response.json();
        }).then(jsonResponse => {
            userId = jsonResponse.id;
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({name: playlist})
            }).then(response => response.json())
            .then(jsonResponse => {
                const playlistId = jsonResponse.id;
                return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({uris: trackUris})
                })
            })
        })
    }
};

export default Spotify;