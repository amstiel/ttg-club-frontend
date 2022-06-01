package club.dnd5.portal.dto.api.classes;

import java.util.List;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import club.dnd5.portal.dto.api.SourceApiDto;
import club.dnd5.portal.model.classes.HeroClass;
import lombok.Getter;
import lombok.Setter;

@JsonInclude(Include.NON_NULL)

@Getter
@Setter
public class ClassApi {
	private NameApi name;
	private String url;
	private SourceApiDto source;
	private String dice;
	private List<ArchetypeApiDto> archetypes;
	private String icon;

	public ClassApi(HeroClass heroClass) {
		name = new NameApi(heroClass.getCapitalazeName(), heroClass.getEnglishName());
		url = String.format("/classes/%s", heroClass.getUrlName());
		source = new SourceApiDto(heroClass.getBook());
		dice = String.format("к%d", heroClass.getDiceHp());
		archetypes = heroClass.getArchetypes().stream().map(ArchetypeApiDto::new).collect(Collectors.toList());
		icon = String.format("class-%s", heroClass.getEnglishName().replace(' ', '-').toLowerCase());
	}
}