import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, ListView } from 'react-native';
import { getProductsForCategory } from '../../actions/index';
import ProductListItem from './ProductListItem';
import { Spinner } from '../common';

class ProductList extends Component {
	static navigationOptions = ({ navigation }) => ({
		title: navigation.state.params.title,
		headerBackTitle: ' '
	});

	componentWillMount() {
		this.createDataSource(this.props);
		this.props.getProductsForCategory({
			id: this.props.category.id,
			magento: this.props.magento
		});
	}

	componentWillReceiveProps(nextProps) {
		this.createDataSource(nextProps);
	}

	onEndReached() {
		const {
			canLoadMoreContent,
			loadingMore,
			products,
			magento,
			category
		} = this.props;

		if (!loadingMore && canLoadMoreContent) {
			this.props.getProductsForCategory({
				id: category.id,
				magento,
				offset: products.length
			});
		}
	}

	createDataSource({ products }) {
		const ds = new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2
		});

		this.dataSource = ds.cloneWithRows(products);
	}

	renderRow(product) {
		return <ProductListItem product={product} />;
	}

	renderFooter() {
		if (this.props.canLoadMoreContent) {
			return <Spinner style={{ padding: 15 }} />;
		}
	}

	renderContent() {
		if (this.props.products.length) {
			return (
					<ListView
							enableEmptySections
							dataSource={this.dataSource}
							renderRow={this.renderRow}
							onEndReached={this.onEndReached.bind(this)}
							onEndReachedThreshold={10}
							renderFooter={this.renderFooter.bind(this)}
					/>
			);
		}

		return <Spinner />;
	}

	render() {
		return (
				<View style={styles.containerStyle}>
					{this.renderContent()}
				</View>
		);
	}
}

const styles = {
	containerStyle: {
		flex: 1,
		backgroundColor: '#fff'
	}
};

const mapStateToProps = state => {
	const { category } = state.category.current;
	const { products, totalCount, loadingMore } = state.category;
	const { magento } = state;
	const canLoadMoreContent = products.length < totalCount;

	return { category, magento, products, totalCount, canLoadMoreContent, loadingMore };
};

export default connect(mapStateToProps, { getProductsForCategory })(ProductList);
