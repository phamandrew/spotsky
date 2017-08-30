import React from 'react';
import ReactDOM from 'react-dom';

var config = {
	apiKey: "AIzaSyAXoov9iPmDret9VvRcRP4CDwLr6hcHeAg",
	authDomain: "spot-app-c6b4c.firebaseapp.com",
	databaseURL: "https://spot-app-c6b4c.firebaseio.com",
	projectId: "spot-app-c6b4c",
	storageBucket: "spot-app-c6b4c.appspot.com",
	messagingSenderId: "326612009814"
};
firebase.initializeApp(config);


const auth = firebase.auth();
var provider = new firebase.auth.GoogleAuthProvider();


class App extends React.Component {
	constructor() {
		super();
		this.state = {
			spots: [],
			nameInput: '',
			locationInput: '',
			imageUploading: false,
			descriptionInput: '',
			loggedIn: false,
			user: null,
			displayForm: false
		}
		this.handleSubmit = this.handleSubmit.bind(this)
		this.handleChange = this.handleChange.bind(this)
		this.login = this.login.bind(this);
		this.logout = this.logout.bind(this);
		this.imageUpload = this.imageUpload.bind(this);
		this.toggleForm = this.toggleForm.bind(this);
	}

	handleChange(e){
		this.setState({
			[e.target.name]:e.target.value
		})
	}

	imageUpload(e){
		const file = e.target.files[0];
		const storageRef = firebase.storage().ref('spotsPhotos/' + file.name);

		this.setState({
			imageUploading: true
		});
		const task = storageRef.put(file).then((snapshot) => {
			storageRef.getDownloadURL().then((url) => {
				this.setState({
					image: url,
					imageUploading: false
				});
			});
		})
	}

	handleSubmit(e) {
		e.preventDefault();
		const spotsRef = firebase.database().ref('spots');
		const spot = {
			name: this.state.nameInput,
			location: this.state.locationInput,
			description: this.state.descriptionInput,
			image: this.state.image
		}
		spotsRef.push(spot);
		this.setState ({
			nameInput: '',
			locationInput: '',
			descriptionInput: '',
			// imageUpload: '',
			displayForm: !this.state.displayForm
		});
	}
	toggleForm() {
		this.setState ({
			displayForm: !this.state.displayForm
		});
	}
	login() {
		auth.signInWithRedirect(provider)
		.then((res) => {
			const user = res.user;
			this.setState ({
				user: user,
				loggedIn: true
			})
		});
	}
	logout() {
		auth.signOut()
			.then(() => {
				this.setState ({
					user: null,
					loggedIn: false
				})
			});
	}
	componentDidMount() {
		auth.onAuthStateChanged((user) => {
			if (user) {
				this.setState ({
					user: user,
					loggedIn: true
				})
				const spotsRef = firebase.database().ref('spots');
				spotsRef.on('value', (snapshot) => {
					let spots = snapshot.val();
					let newState = [];
					for (let spot in spots) {
						newState.push({
							id: spot,
							name: spots[spot].name,
							location: spots[spot].location,
							description: spots[spot].description,
							image: spots[spot].image
						});
					}
					this.setState ({
						spots: newState
					});
				});
			}
			else {
				this.setState ({
					user: null,
					loggedIn: false
				});
			}
		});
	}
	render() {
		const showSpots = () => {
			if (this.state.loggedIn === true) {
				return (
					<main>
						<header>
							<h1>Spotsky</h1>
							<div>
								<button onClick={this.toggleForm}>Add Spot</button>
								<button onClick={this.logout}>Log Out</button>
							</div>
						</header>
					
					{this.state.displayForm === true && 
						<div className="form-container">
							<form onSubmit={(e) => this.handleSubmit(e)}>
								<i onClick={this.toggleForm} className="fa fa-times" aria-hidden="true"></i>
								<input className="nameInput" name="nameInput" onChange={this.handleChange} value={this.state.nameInput} placeholder="Name of Spot"/>
								<input className="locationInput" name="locationInput" onChange={this.handleChange} value={this.state.locationInput} placeholder="Where's the spot?"/>
								<textarea className="descriptionInput" name="descriptionInput" onChange={this.handleChange} value={this.state.descriptionInput} placeholder="Spot Description"/>
								<input className="imageUpload" type="file" name="imageUpload" onChange={this.imageUpload} value={this.state.imageUpload} placeholder="Upload An Image"/>
								{this.state.imageUploading === false && <button>Add Spot</button>}
							</form>
						</div>
					}
						<div className="displaySpots">
							<ul>
								{this.state.spots.map((spot) => {
									return (
										<li key={spot.id}>
											<div className="spotImage" style={{ backgroundImage: `url(${spot.image})` }}></div>
											<h2>{spot.name}</h2>
											<div className="spotDown">
												<h3>{spot.location}</h3>
												<p>{spot.description}</p>
											</div>
										</li>
									)
								})}
							</ul>
						</div>
					</main>
				)
			}
			else {
				return (
					<main>
						<section className="loginPage">
							<div className="title">
								<h1 className="logInTitle">Spotsky</h1>
								<button className="logIn" onClick={this.login}>Log In</button>
							</div>
						</section>
					</main>
				)
			}
		}
		return (
			<main>
				{showSpots()}
			</main>
		)
	}
}

ReactDOM.render(<App />, document.getElementById('app'));


