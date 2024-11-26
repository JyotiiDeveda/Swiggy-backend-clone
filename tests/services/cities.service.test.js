const { City } = require('../../src/models');
const { Op } = require('sequelize');
const commonHelpers = require('../../src/helpers/common.helper');
const citiesService = require('../../src/services/cities.service');

jest.mock('../../src/models');
jest.mock('../../src/helpers/common.helper');

describe('Cities Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should successfully create a new city', async () => {
      const city = 'New York';
      const createdCity = { id: 1, name: city };

      City.findOne.mockResolvedValue(null);
      City.create.mockResolvedValue(createdCity);

      const result = await citiesService.create(city);

      expect(City.findOne).toHaveBeenCalledWith({ where: { name: { [Op.iLike]: city } } });
      expect(City.create).toHaveBeenCalledWith({ name: city });
      expect(result).toEqual(createdCity);
    });

    it('should throw an error if the city already exists', async () => {
      const city = 'New York';
      const existingCity = { id: 1, name: city };

      City.findOne.mockResolvedValue(existingCity);
      commonHelpers.customError.mockImplementation((message, statusCode) => {
        const error = new Error(message);
        error.statusCode = statusCode;
        throw error;
      });

      await expect(citiesService.create(city)).rejects.toThrow('City already exists');
      expect(City.findOne).toHaveBeenCalledWith({ where: { name: { [Op.iLike]: city } } });
      expect(City.create).not.toHaveBeenCalled();
    });

    it('should throw an error if city creation fails', async () => {
      const city = 'New York';

      City.findOne.mockResolvedValue(null);
      City.create.mockResolvedValue(null);
      commonHelpers.customError.mockImplementation((message, statusCode) => {
        const error = new Error(message);
        error.statusCode = statusCode;
        throw error;
      });

      await expect(citiesService.create(city)).rejects.toThrow('Failed to create new City');
      expect(City.findOne).toHaveBeenCalledWith({ where: { name: { [Op.iLike]: city } } });
      expect(City.create).toHaveBeenCalledWith({ name: city });
    });
  });

  describe('getAll', () => {
    it('should successfully return all cities', async () => {
      const mockCities = [
        { id: 1, name: 'New York' },
        { id: 2, name: 'Los Angeles' },
      ];

      City.findAll.mockResolvedValue(mockCities);

      const result = await citiesService.getAll();

      expect(City.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockCities);
    });

    it('should throw an error if no cities are found', async () => {
      City.findAll.mockResolvedValue([]);
      commonHelpers.customError.mockImplementation((message, statusCode) => {
        const error = new Error(message);
        error.statusCode = statusCode;
        throw error;
      });

      await expect(citiesService.getAll()).rejects.toThrow('No cities found');
      expect(City.findAll).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should successfully delete a city', async () => {
      const cityId = 1;
      const mockCity = { id: cityId, name: 'New York' };

      City.findByPk.mockResolvedValue(mockCity);
      City.destroy.mockResolvedValue(1);

      await citiesService.remove(cityId);

      expect(City.findByPk).toHaveBeenCalledWith(cityId);
      expect(City.destroy).toHaveBeenCalledWith({ where: { id: cityId } });
    });

    it('should throw an error if the city is not found', async () => {
      const cityId = 1;

      City.findByPk.mockResolvedValue(null);
      commonHelpers.customError.mockImplementation((message, statusCode) => {
        const error = new Error(message);
        error.statusCode = statusCode;
        throw error;
      });

      await expect(citiesService.remove(cityId)).rejects.toThrow('City not found');
      expect(City.findByPk).toHaveBeenCalledWith(cityId);
      expect(City.destroy).not.toHaveBeenCalled();
    });
  });
});
