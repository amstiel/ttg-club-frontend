package club.dnd5.portal.controller;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import javax.servlet.RequestDispatcher;
import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Order;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import club.dnd5.portal.dto.RaceDto;
import club.dnd5.portal.model.AbilityType;
import club.dnd5.portal.model.image.ImageType;
import club.dnd5.portal.model.races.Feature;
import club.dnd5.portal.model.races.Race;
import club.dnd5.portal.repository.ImageRepository;
import club.dnd5.portal.repository.classes.RaceRepository;

@Controller
public class RaceController {
	@Autowired
	private RaceRepository raceRepository;
	@Autowired
	private ImageRepository imageRepository;
	@Autowired
	private ImageRepository imageRepo;
	
	@GetMapping("/races")
	public String getRaces(Model model) {
		model.addAttribute("abilities", AbilityType.values());
		model.addAttribute("metaTitle", "Расы (Races) D&D 5e");
		model.addAttribute("metaUrl", "https://dnd5.club/races");
		model.addAttribute("metaDescription", "Расы персонажей по D&D 5 редакции");
		return "races";
	}
	
	@GetMapping("/races/{name}")
	public String getRace(Model model, @PathVariable String name, HttpServletRequest request) {
		model.addAttribute("abilities", AbilityType.values());
		Race race = raceRepository.findByEnglishName(name.replace('_', ' ')).get();
		model.addAttribute("races", raceRepository.findAllByParent(null, getRaceSort()));
		model.addAttribute("selectedRace", new RaceDto(race));

		List<Feature> features =  race.getFeatures().stream().filter(Feature::isFeature).collect(Collectors.toList());
		model.addAttribute("features", features);
		List<Feature> notFeatures =  race.getFeatures().stream().filter(Feature::isNotFeature).collect(Collectors.toList());
		model.addAttribute("notFeatures", notFeatures);
		
		model.addAttribute("metaTitle", race.getName() + " | Расы D&D 5e");
		model.addAttribute("metaUrl", "https://dnd5.club/races/" + name);
		model.addAttribute("metaDescription", String.format("%s - раса персонажа по D&D 5 редакции", race.getCapitalazeName()));
		Collection<String> images = imageRepo.findAllByTypeAndRefId(ImageType.RACE, race.getId());
		if (!images.isEmpty()) {
			model.addAttribute("metaImage", images.iterator().next());
		}
		return "races";
	}
	
	@GetMapping("/races/{name}/{subrace}")
	public String getSubraceList(Model model, @PathVariable String name, @PathVariable String subrace, HttpServletRequest request) {
		Race race = raceRepository.findByEnglishName(subrace.replace('_', ' ')).get();
		if (race == null) {
			request.setAttribute(RequestDispatcher.ERROR_STATUS_CODE, "404");
			return "forward: /error";
		}
		model.addAttribute("abilities", AbilityType.values());

		model.addAttribute("races", raceRepository.findAllByParent(null, getRaceSort()));
		model.addAttribute("selectedRace", new RaceDto(race.getParent()));
		model.addAttribute("selectedSubrace", new RaceDto(race));

		model.addAttribute("metaTitle", String.format("%s | Расы | Разновидности D&D 5e", race.getCapitalazeName()));
		model.addAttribute("metaUrl", "https://dnd5.club/races/" + name + "/" + subrace);
		model.addAttribute("metaDescription", String.format("%s - разновидность расы персонажа по D&D 5 редакции", race.getName()));
		Collection<String> images = imageRepository.findAllByTypeAndRefId(ImageType.RACE, race.getId());
		model.addAttribute("images", images);
		if (!images.isEmpty()) {
			model.addAttribute("metaImage", images.iterator().next());
		}
		return "races";
	}
	
	@GetMapping("/races/fragment/{id}")
	public String getFragmentRace(Model model, @PathVariable Integer id) {
		Race race = raceRepository.findById(id).get();
		List<Feature> features =  race.getFeatures().stream().filter(Feature::isFeature).collect(Collectors.toList());
		model.addAttribute("features", features);
		List<Feature> notFeatures =  race.getFeatures().stream().filter(Feature::isNotFeature).collect(Collectors.toList());
		model.addAttribute("notFeatures", notFeatures);
		model.addAttribute("race", race);
		model.addAttribute("selectedRaceName", "--- Выбор подрасы ---");
		Collection<String> images = imageRepository.findAllByTypeAndRefId(ImageType.RACE, race.getId());
		model.addAttribute("images", images);
		if (!images.isEmpty()) {
			model.addAttribute("metaImage", images.iterator().next());
		}
		return "fragments/race :: view";
	}
	
	@GetMapping("/races/{raceName}/subrace/{subraceName}")
	public String getFragmentSubraces(Model model, @PathVariable String raceName, @PathVariable String subraceName) {
		model.addAttribute("abilities", AbilityType.values());
		Race subRace = raceRepository.findBySubrace(raceName.replace("_", " "), subraceName.replace("_", " ")).orElseThrow(IllegalArgumentException::new);
		final Set<Integer> replaceFeatureIds = subRace.getFeatures().stream().map(Feature::getReplaceFeatureId).filter(Objects::nonNull).collect(Collectors.toSet());
		model.addAttribute("features", 
				subRace.getParent().getFeatures()
				.stream()
				.filter(feature -> !replaceFeatureIds.contains(feature.getId()))
				.filter(feature -> feature.isFeature())
				.collect(Collectors.toList()));
		model.addAttribute("subFeatures", subRace.getFeatures().stream()
				.filter(f -> f.isFeature())
				.collect(Collectors.toList()));
		List<Feature> notFeatures =  subRace.getParent().getFeatures().stream().filter(Feature::isNotFeature).collect(Collectors.toList());
		model.addAttribute("notFeatures", notFeatures);
		model.addAttribute("race", subRace);
		model.addAttribute("selectedSubrace", subRace.getEnglishName());
		model.addAttribute("selectedRaceName", subRace.getName());

		Collection<String> images = imageRepository.findAllByTypeAndRefId(ImageType.RACE, subRace.getId());
		model.addAttribute("images", images);
		if (!images.isEmpty()) {
			model.addAttribute("metaImage", images.iterator().next());
		}
		return "fragments/race :: view";
	}
	
	@GetMapping("/races/{englishName}/subraces/list")
	public String getArchitypeList(Model model,@PathVariable String englishName) {
		Race race = raceRepository.findByEnglishName(englishName.replace("_", " ")).orElseThrow(IllegalArgumentException::new);
		model.addAttribute("images", imageRepository.findAllByTypeAndRefId(ImageType.RACE, race.getId()));
		model.addAttribute("race", race);
		model.addAttribute("subraces", race.getSubRaces());
		return "fragments/subraces_list :: sub_menu"; 
	}
	
	private Sort getRaceSort() {
		List<Order> orders = new ArrayList<>(1);
		//Order order1 = new Order(Sort.Direction.DESC, "book.type");
		//orders.add(order1);
		Order order2 = new Order(Sort.Direction.ASC, "name");
		orders.add(order2);
		return Sort.by(orders);
	}
}