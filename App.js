import React from 'react';
import { Text, View, TouchableOpacity, TextInput, Alert, ScrollView, Image } from 'react-native';
import * as Permissions from 'expo-permissions';
import * as ImageManipulator from 'expo-image-manipulator';
import { Camera } from 'expo-camera';

function upload(img, pi) {
	var piURI = "https://bot" + pi + ".seattleacademy.software/img"


	// var details = {
	// 	'img': img.base64,
	// 	'uri': piURI,
	// };

	// var formBody = [];

	// for (var property in details) {
	// 	var encodedKey = encodeURIComponent(property);
	// 	var encodedValue = encodeURIComponent(details[property]);
	// 	formBody.push(encodedKey + "=" + encodedValue);
	// }

	// formBody = formBody.join("&");


	return fetch(piURI, {
		method: 'POST',
		body: 'data:image/jpeg;base64,' + img.base64
	});
}

export default class CameraExample extends React.Component {
	state = {
		piNumber: '3',
		updateInterval: '1000',
		imageWidth: '100',
		compressedURI: '',
		responceData: 'wait...',
		hasCameraPermission: null,
		type: Camera.Constants.Type.back,
	};

	async componentDidMount() {
		const { status } = await Permissions.askAsync(Permissions.CAMERA);
		this.setState({ hasCameraPermission: status === 'granted' });
	}

	

	render() {

		const { hasCameraPermission } = this.state;

		const { piNumber } = this.state;

		const parent = this;

		if (hasCameraPermission === null) {
				return <View />;

		} else if (hasCameraPermission === false) {
				return <Text>No access to camera</Text>;

		} else {
			return (


				<View style={{ flex: 1 }}>


					<Camera ref={ref => {this.camera = ref;}} 
						style = {{ flex: 0.5}} type={this.state.type}>

						<View
							style = {{
								flex: 1,
								backgroundColor: 'transparent',
								flexDirection: 'row',
							}}>

							<TouchableOpacity
								style = {{
									flex: 0.1,
									alignSelf: 'flex-end',
									alignItems: 'center',
								}}

								onPress={() => {
									this.setState({
										type:
											this.state.type === Camera.Constants.Type.back ? 
											Camera.Constants.Type.front : Camera.Constants.Type.back,
									});
								}}>

								<Text style = {{ fontSize: 18, marginBottom: 10, color: 'white' }}>
									Flip 
								</Text>

							</TouchableOpacity>
						</View>

						<View
							style = {{
								flex: 1,
								backgroundColor: 'transparent',
								flexDirection: 'row',

							}}>

							<TouchableOpacity
								style = {{
									flex: 0.1,
									alignSelf: 'flex-end',
								}}

								onPress={() => {
									
									if (this.camera) {
										var pictureSize = {width:parent.state.imageWidth,height:parent.state.imageWidth};

										var picture = this.camera.takePictureAsync({
											// Picture settings
											flashMode:'on',
											quality: 0.1,
											width:1,
											exif:'true',
											doNotSave:false,
											base64:false
										}).then(function(imgObject){

											
											// Works on both iOS and Android
											Alert.alert(
												'Command',
												'Sending image to robot ' + piNumber,
												[
													{
														text: 'View URI', 
														onPress: () => Alert.alert(
																'URI',
																imgObject.uri
															) 
													},
													{
														text: 'OK'
													},
												],
												{ cancelable: false }
											);

											var runLoop = setInterval(function(){
												ImageManipulator.manipulateAsync(
													imgObject.uri, 
													[{resize:pictureSize}], 
													{compress:0, format:ImageManipulator.SaveFormat.PNG, base64:true}
												).then(img => {
													upload(img, piNumber).then(responce => parent.setState({ responceData: responce })); 
													parent.setState({compressedURI: img.uri})
												});

												console.log("sent");
											}, parent.state.updateInterval);

											parent.setState({runLoop: runLoop});
										
										});
									}
								}}>

								<Text style = {{ fontSize: 18,width:100,  marginBottom: 10, color: 'white'}}> Start </Text>

							</TouchableOpacity>

							<TouchableOpacity
								style = {{
									flex: 0.1,
									whiteSpace: 'pre-wrap',
									alignSelf: 'flex-end',
								}}

								onPress={() => {
									clearInterval(this.state.runLoop);

								}}>

								<Text style = {{ fontSize: 18,width:100,  marginBottom: 10, color: 'white'}}> Stop </Text>

							</TouchableOpacity>

						</View>

					</Camera>

					<ScrollView
						style= {{
							flex: 0.5,
							padding: 10
						}}>

						<Text style = {{ fontSize: 18, width:200, marginTop: 10, marginBottom: 10, color: 'black'}}> RaspberryPI Number:  </Text>

						<TextInput
							style={{
								padding: 4,
								borderColor: 'gray', 
								borderWidth: 1,
								borderRadius: 4
							}}
							defaultValue="3"
							numeric
							keyboardType={'numeric'}
							onChangeText={text => { this.setState({ piNumber: text })}}
							returnKeyType={"done"}
						/>

						<Text style = {{ fontSize: 18, width:200, marginTop: 10, marginBottom: 10, color: 'black'}}> Image width:  </Text>

						<TextInput
							style={{
								padding: 4,
								borderColor: 'gray', 
								borderWidth: 1,
								borderRadius: 4
							}}
							defaultValue="10"
							numeric
							keyboardType={'numeric'}
							onChangeText={text => { this.setState({ imageWidth: text })}}
							returnKeyType={"done"}
						/>

						<Text style = {{ fontSize: 18, width:200, marginTop: 10, marginBottom: 10, color: 'black'}}> Update Interval:  </Text>

						<TextInput
							style={{
								padding: 4,
								borderColor: 'gray', 
								borderWidth: 1,
								borderRadius: 4
							}}
							defaultValue="1000"
							numeric
							keyboardType={'numeric'}
							onChangeText={text => { this.setState({ updateInterval: text })}}
							returnKeyType={"done"}
						/>

						<Text style = {{ fontSize: 18, width:200, marginTop: 10, marginBottom: 10, color: 'black'}}> Debug:  </Text>

						<Text style = {{ fontSize: 12, width:'100%',  marginBottom: 10, color: 'darkgray'}}> 
							{JSON.stringify(this.state.responceData)}
						</Text>

						<View style={{ marginVertical: 20, alignItems: 'center', justifyContent: 'center' }}>
					        <Image
					        	source={{ uri: parent.state.compressedURI }}
					        	style={{ width: 300, height: 300, resizeMode: 'contain' }}
					        />
				      	</View>

					</ScrollView>
				</View>
			);
		}
	}
}
