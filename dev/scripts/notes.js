
// To Add in spot-app 2.0
removeSpot(spotId) {
	const spotsRef = firebase.database().ref('./spots/${spotId}')
	spotsRef.remove();
}